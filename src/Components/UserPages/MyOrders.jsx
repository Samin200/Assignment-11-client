import { useEffect, useState, useContext } from "react";
import { Link } from "react-router";
import api from "../../utilitys/api";
import { AuthContext } from "../../Context/AuthContext";
import Swal from "sweetalert2";

const StatusPill = ({ order }) => {
  if (order.paymentStatus === "paid")      return <span className="badge badge-success font-semibold gap-1">✅ Paid</span>;
  if (order.status === "cancelled")        return <span className="badge badge-error font-semibold gap-1">✗ Cancelled</span>;
  if (order.status === "shipped")          return <span className="badge badge-info font-semibold gap-1">🚚 Shipped</span>;
  if (order.status === "delivered")        return <span className="badge badge-success font-semibold gap-1">📦 Delivered</span>;
  return <span className="badge badge-warning font-semibold gap-1">⏳ Pending Payment</span>;
};

export default function MyOrders() {
  const { user } = useContext(AuthContext);   // ✅ use context not auth.currentUser
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const fetchOrders = async () => {
    if (!user?.email) return;
    try {
      const res = await api.get(`/orders?email=${user.email}`);  // ✅ relative URL
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchOrders();

    const params = new URLSearchParams(window.location.search);
    const paymentParam = params.get("payment");
    const sessionId = params.get("session_id");

    if (paymentParam === "success") {
      if (sessionId) {
        // Fallback checks the stripe session directly and updates DB if webhook was missed
        api.post("/api/verify-payment", { sessionId }).then(() => fetchOrders()).catch(console.error);
      }
      Swal.fire({ icon: "success", title: "Payment Successful! 🎉", text: "Your order is now completed.", timer: 4000, toast: true, position: "top-end" });
      window.history.replaceState({}, "", "/my-orders");
      const iv = setInterval(fetchOrders, 2000);
      setTimeout(() => clearInterval(iv), 20000);
      setActiveTab("completed");
    }
    if (paymentParam === "cancelled") {
      Swal.fire({ icon: "info", title: "Payment Cancelled", text: "You can try again anytime.", timer: 3000, toast: true, position: "top-end" });
      window.history.replaceState({}, "", "/my-orders");
    }
  }, [user]);

  const handleCancel = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel this order?", text: "This action cannot be undone.", icon: "warning",
      showCancelButton: true, confirmButtonText: "Yes, cancel it", confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);   // ✅ relative URL
      Swal.fire({ icon: "success", title: "Cancelled!", timer: 1500, showConfirmButton: false });
      fetchOrders();
    } catch {
      Swal.fire("Error", "Could not cancel order", "error");
    }
  };

  const handlePay = async (order) => {
    try {
      const res = await api.post("/create-checkout-session", {   // ✅ relative URL
        orderId: order._id, bookName: order.bookName, price: order.price,
      });
      window.location.href = res.data.url;
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Payment failed", "error");
    }
  };

  const activeOrders    = orders.filter(o => o.status === "pending" && o.paymentStatus === "unpaid");
  const completedOrders = orders.filter(o => o.paymentStatus === "paid");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  const tabData = { active: activeOrders, completed: completedOrders, cancelled: cancelledOrders };
  const current = tabData[activeTab];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-2">Account</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Orders</h1>
          <p className="text-base-content/50 text-sm mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed w-fit gap-1 flex-wrap">
          {[
            { id: "active",    label: `⏳ Active (${activeOrders.length})`       },
            { id: "completed", label: `✅ Completed (${completedOrders.length})` },
            { id: "cancelled", label: `✗ Cancelled (${cancelledOrders.length})`  },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`tab ${activeTab === t.id ? "tab-active" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="text-7xl opacity-20">📚</p>
            <p className="text-xl font-bold">No orders yet</p>
            <p className="text-base-content/50">Time to discover some great books!</p>
            <Link to="/books" className="btn btn-primary rounded-full mt-2">Browse Books</Link>
          </div>
        )}

        {/* Tab empty */}
        {orders.length > 0 && current.length === 0 && (
          <div className="text-center py-16 text-base-content/40">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-medium">No {activeTab} orders</p>
          </div>
        )}

        {/* Order cards */}
        {current.length > 0 && (
          <div className="space-y-4">
            {current.map(order => (
              <div key={order._id} className="card bg-base-100 shadow border border-base-300 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="card-body p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-5">

                    {/* Book cover */}
                    {order.bookImage && (
                      <img
                        src={order.bookImage}
                        alt={order.bookName}
                        className="w-full sm:w-20 h-32 sm:h-28 object-cover rounded-xl flex-shrink-0 border border-base-200"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-black leading-tight line-clamp-1">{order.bookName}</h2>
                          {order.authorName && <p className="text-sm text-base-content/50">{order.authorName}</p>}
                        </div>
                        <StatusPill order={order} />
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-base-content/60">
                        <span>💰 <span className="font-semibold text-primary">${Number(order.price).toFixed(2)}</span></span>
                        {order.orderDate && (
                          <span>📅 {new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                        )}
                        {order.status !== "pending" && (
                          <span className="capitalize">📦 {order.status}</span>
                        )}
                      </div>

                      {/* Order ID */}
                      <p className="text-xs text-base-content/30 font-mono">
                        #{order._id.toString().slice(-10).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.paymentStatus === "unpaid" && order.status === "pending" && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-base-200">
                      <button onClick={() => handleCancel(order._id)} className="btn btn-outline btn-warning btn-sm rounded-full flex-1">
                        Cancel Order
                      </button>
                      <button onClick={() => handlePay(order)} className="btn btn-success btn-sm rounded-full flex-1 shadow">
                        💳 Pay Now — ${Number(order.price).toFixed(2)}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}