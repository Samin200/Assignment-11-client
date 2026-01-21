import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../../Firebase/firebase.init";
import Swal from "sweetalert2";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const user = auth.currentUser;

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://localhost:5020/orders?email=${user.email}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const params = new URLSearchParams(window.location.search);
    const paymentParam = params.get("payment");

    if (paymentParam === "success") {
      Swal.fire({
        icon: "success",
        title: "Payment Successful! 🎉",
        text: "Your order is now completed.",
        timer: 4000,
        toast: true,
        position: "top-end",
      });
      window.history.replaceState({}, "", "/my-orders");
      const refreshInterval = setInterval(fetchOrders, 2000);
      setTimeout(() => clearInterval(refreshInterval), 20000);
      setActiveTab("completed");
    }

    if (paymentParam === "cancelled") {
      Swal.fire({
        icon: "info",
        title: "Payment Cancelled",
        text: "You can try again anytime.",
        timer: 3000,
        toast: true,
        position: "top-end",
      });
      window.history.replaceState({}, "", "/my-orders");
    }
  }, [user]);

  const handleCancel = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel this order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`http://localhost:5020/orders/${orderId}/cancel`);
        Swal.fire("Cancelled!", "Your order has been cancelled.", "success");
        fetchOrders();
      } catch {
        Swal.fire("Error", "Could not cancel order", "error");
      }
    }
  };

  const handlePay = async (order) => {
    try {
      const res = await axios.post("http://localhost:5020/create-checkout-session", {
        orderId: order._id,
        bookName: order.bookName,
        price: order.price,
      });
      window.location.href = res.data.url;
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Payment failed", "error");
    }
  };

  const activeOrders = orders.filter(o => o.status === "pending" && o.paymentStatus === "unpaid");
  const completedOrders = orders.filter(o => o.paymentStatus === "paid");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  const hasAnyOrders = orders.length > 0;

  return (
    <div className="min-h-screen bg-base-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-primary">
          My Orders
        </h1>

        {/* Tabs - Stack on mobile, horizontal on larger */}
        <div className="flex flex-col sm:flex-row justify-center mb-8 gap-2">
          <button
            className={`btn btn-lg w-full sm:w-auto ${activeTab === "active" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("active")}
          >
            Active ({activeOrders.length})
          </button>
          <button
            className={`btn btn-lg w-full sm:w-auto ${activeTab === "completed" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed ({completedOrders.length})
          </button>
          <button
            className={`btn btn-lg w-full sm:w-auto ${activeTab === "cancelled" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled ({cancelledOrders.length})
          </button>
        </div>

        {/* Content */}
        {!hasAnyOrders ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-30">📚</div>
            <p className="text-xl text-gray-500">No orders yet.</p>
            <p className="text-gray-400 mt-2">Time to discover some great books!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {(activeTab === "active" ? activeOrders : activeTab === "completed" ? completedOrders : cancelledOrders).length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-lg">
                No {activeTab} orders.
              </div>
            ) : (
              (activeTab === "active" ? activeOrders : activeTab === "completed" ? completedOrders : cancelledOrders).map((order) => (
                <div key={order._id} className="card bg-base-100 shadow-xl border border-base-300">
                  <div className="card-body p-6">
                    {/* Stack on mobile, side-by-side on larger */}
                    <div className="flex flex-col gap-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{order.bookName}</h2>
                        <p className="text-sm text-gray-500">
                          Ordered on: {new Date(order.orderDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Actions - Full width on mobile, stacked nicely */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        {order.paymentStatus === "unpaid" && order.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleCancel(order._id)}
                              className="btn btn-outline btn-warning flex-1"
                            >
                              Cancel Order
                            </button>
                            <button
                              onClick={() => handlePay(order)}
                              className="btn btn-success flex-1 shadow-lg"
                            >
                              Pay Now
                            </button>
                          </>
                        ) : order.paymentStatus === "paid" ? (
                          <div className="flex items-center justify-center sm:justify-start gap-3 text-success font-bold text-lg">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Paid & Completed
                          </div>
                        ) : (
                          <span className="text-error font-bold text-lg text-center sm:text-left">
                            ✗ Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}