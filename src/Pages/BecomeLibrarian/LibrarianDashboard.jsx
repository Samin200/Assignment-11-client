import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import api from "../../utilitys/api";
import { AuthContext } from "../../Context/AuthContext";
import Swal from "sweetalert2";

const StatCard = ({ label, value, icon, color }) => (
  <div className={`card bg-base-100 shadow border-l-4 ${color}`}>
    <div className="card-body flex-row items-center justify-between py-5 px-5">
      <div>
        <p className="text-xs text-base-content/50 font-medium">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <span className="text-3xl opacity-20">{icon}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = { published: "badge-success", unpublished: "badge-warning", pending: "badge-info", shipped: "badge-primary", delivered: "badge-success", cancelled: "badge-error" };
  return <span className={`badge badge-sm font-semibold capitalize ${map[status] || "badge-ghost"}`}>{status}</span>;
};

const LibrarianDashboard = () => {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();

  const [myBooks, setMyBooks]   = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("books");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = user.role === "admin" ? {} : { addedBy: user.email };
      const [booksRes, ordersRes] = await Promise.all([
        api.get("/books", { params }),
        api.get("/orders"),
      ]);
      setMyBooks(booksRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (book) => {
    const newStatus = book.status === "published" ? "unpublished" : "published";

    // Block librarian from trying to republish an admin-locked book
    if (book.adminLocked && newStatus === "published") {
      return Swal.fire({
        icon: "warning",
        title: "Admin Restricted",
        text: "This book was unpublished by an admin. Only an admin can republish it.",
      });
    }

    const result = await Swal.fire({
      title: `${newStatus === "published" ? "Publish" : "Unpublish"} this book?`,
      text: newStatus === "unpublished" ? "The book will be hidden from the public library." : "The book will be visible to all users.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
    });
    if (!result.isConfirmed) return;

    try {
      await api.patch(`/books/${book._id}`, { status: newStatus });
      setMyBooks(prev => prev.map(b => b._id === book._id ? { ...b, status: newStatus } : b));
      Swal.fire({ icon: "success", title: `Book ${newStatus}!`, timer: 1500, showConfirmButton: false });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update book status.";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleDeleteBook = async (bookId) => {
    const result = await Swal.fire({
      title: "Delete Book?",
      text: "This will permanently remove the book and all related orders.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/books/${bookId}`);
      setMyBooks(prev => prev.filter(b => b._id !== bookId));
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire("Error", "Failed to delete book.", "error");
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      Swal.fire("Error", "Failed to update order status.", "error");
    }
  };

  // Stats
  const publishedCount   = myBooks.filter(b => b.status === "published").length;
  const unpublishedCount = myBooks.filter(b => b.status === "unpublished").length;
  const pendingOrders    = orders.filter(o => o.status === "pending").length;

  // Filtered rows
  const filteredBooks  = myBooks.filter(b =>
    b.bookName?.toLowerCase().includes(search.toLowerCase()) ||
    b.authorName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOrders = orders.filter(o =>
    o.bookName?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-1">
              {user?.role === "admin" ? "Admin" : "Librarian"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Dashboard</h1>
            <p className="text-base-content/50 text-sm mt-1">{user?.email}</p>
          </div>
          <Link to="/add-book" className="btn btn-primary rounded-full gap-2 self-start sm:self-auto">
            ＋ Add New Book
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Books"   value={myBooks.length}     icon="📚" color="border-primary" />
          <StatCard label="Published"     value={publishedCount}     icon="✅" color="border-success" />
          <StatCard label="Unpublished"   value={unpublishedCount}   icon="🚫" color="border-warning" />
          <StatCard label="Pending Orders" value={pendingOrders}     icon="📦" color="border-error"   />
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed w-fit gap-1">
          <button className={`tab ${activeTab === "books"  ? "tab-active" : ""}`} onClick={() => { setActiveTab("books");  setSearch(""); }}>
            📚 Books ({myBooks.length})
          </button>
          <button className={`tab relative ${activeTab === "orders" ? "tab-active" : ""}`} onClick={() => { setActiveTab("orders"); setSearch(""); }}>
            📦 Orders ({orders.length})
            {pendingOrders > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-error text-error-content text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {pendingOrders}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40">🔍</span>
          <input
            type="text"
            placeholder={activeTab === "books" ? "Search by title or author…" : "Search by book or customer email…"}
            className="input input-bordered w-full pl-11 rounded-xl bg-base-100"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content">✕</button>
          )}
        </div>

        {/* ══ BOOKS TAB ══ */}
        {activeTab === "books" && (
          <>
            {filteredBooks.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="text-5xl">📭</p>
                <p className="text-lg font-bold text-base-content/50">
                  {myBooks.length === 0 ? "You haven't added any books yet." : "No books match your search."}
                </p>
                {myBooks.length === 0 && (
                  <Link to="/add-book" className="btn btn-primary rounded-full">＋ Add Your First Book</Link>
                )}
              </div>
            ) : (
              <div className="card bg-base-100 shadow border border-base-300 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead className="bg-base-200">
                      <tr>
                        <th>#</th>
                        <th>Book</th>
                        <th className="hidden md:table-cell">Author</th>
                        <th className="hidden sm:table-cell">Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map((book, i) => (
                        <tr key={book._id} className="hover">
                          <td className="text-base-content/40 text-sm">{i + 1}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <img
                                src={book.bookImage} alt={book.bookName}
                                className="w-10 h-14 object-cover rounded-lg border border-base-300 flex-shrink-0"
                                onError={e => { e.target.src = "https://via.placeholder.com/80x112?text=?"; }}
                              />
                              <div>
                                <p className="font-bold text-sm line-clamp-1">{book.bookName}</p>
                                <p className="text-xs text-base-content/50 md:hidden">{book.authorName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell text-sm text-base-content/70">{book.authorName}</td>
                          <td className="hidden sm:table-cell font-semibold text-primary text-sm">${book.price}</td>
                          <td><StatusBadge status={book.status} /></td>
                          <td>
                            <div className="flex gap-1.5 flex-wrap">
                              {/* Show lock badge if admin locked this book */}
                              {book.adminLocked ? (
                                <span className="btn btn-xs btn-disabled rounded-full gap-1 cursor-not-allowed" title="Locked by admin — cannot republish">
                                  🔒 Locked
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(book)}
                                  className={`btn btn-xs rounded-full ${book.status === "published" ? "btn-warning" : "btn-success"}`}
                                >
                                  {book.status === "published" ? "🚫 Unpublish" : "✅ Publish"}
                                </button>
                              )}
                              <Link to={`/edit-book/${book._id}`} className="btn btn-xs btn-outline rounded-full">✏️ Edit</Link>
                              <button onClick={() => handleDeleteBook(book._id)} className="btn btn-xs btn-outline btn-error rounded-full">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ ORDERS TAB ══ */}
        {activeTab === "orders" && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-5xl">📭</p>
                <p className="text-lg font-bold text-base-content/50">
                  {orders.length === 0 ? "No orders yet." : "No orders match your search."}
                </p>
              </div>
            ) : (
              <div className="card bg-base-100 shadow border border-base-300 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead className="bg-base-200">
                      <tr>
                        <th>#</th>
                        <th>Book</th>
                        <th className="hidden sm:table-cell">Customer</th>
                        <th className="hidden md:table-cell">Price</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Change Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, i) => (
                        <tr key={order._id} className="hover">
                          <td className="text-base-content/40 text-sm">{i + 1}</td>
                          <td>
                            <p className="font-bold text-sm line-clamp-1">{order.bookName}</p>
                            <p className="text-xs text-base-content/50 sm:hidden">{order.email}</p>
                          </td>
                          <td className="hidden sm:table-cell text-sm text-base-content/70">{order.email}</td>
                          <td className="hidden md:table-cell font-semibold text-primary text-sm">${order.price}</td>
                          <td>
                            <span className={`badge badge-sm font-semibold ${order.paymentStatus === "paid" ? "badge-success" : "badge-warning"}`}>
                              {order.paymentStatus === "paid" ? "💳 Paid" : "⏳ Unpaid"}
                            </span>
                          </td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>
                            <select
                              value={order.status}
                              onChange={e => handleOrderStatusChange(order._id, e.target.value)}
                              disabled={order.status === "cancelled"}
                              className="select select-bordered select-xs rounded-lg"
                            >
                              <option value="pending">Pending</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default LibrarianDashboard;