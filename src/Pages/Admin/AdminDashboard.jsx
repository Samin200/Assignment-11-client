import { useState, useContext, useEffect } from "react";
import api from "../../utilitys/api";
import { AuthContext } from "../../Context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTTooltip, Legend as RTLegend, ResponsiveContainer, LineChart, Line } from "recharts";

const StatCard = ({ icon, label, value, color }) => (
  <div className={`card bg-base-100 shadow border-l-4 ${color}`}>
    <div className="card-body flex-row items-center justify-between py-5 px-6">
      <div>
        <p className="text-sm text-base-content/50 font-medium">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <span className="text-4xl opacity-20">{icon}</span>
    </div>
  </div>
);

const RoleBadge = ({ role }) => {
  const map   = { admin: "badge-error", librarian: "badge-warning", user: "badge-success" };
  const label = { admin: "👑 Admin",   librarian: "📚 Librarian",  user: "👤 User" };
  return <span className={`badge badge-sm font-semibold ${map[role] || "badge-ghost"}`}>{label[role] || role}</span>;
};

const AdminDashboard = () => {
  const { user }    = useContext(AuthContext);
  const navigate    = useNavigate();

  const [users, setUsers]                         = useState([]);
  const [books, setBooks]                         = useState([]);
  const [librarianRequests, setLibrarianRequests] = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [actionLoading, setActionLoading]         = useState({});
  const [activeTab, setActiveTab]                 = useState("overview");
  const [expandedReason, setExpandedReason]       = useState(null);
  const [userSearch, setUserSearch]               = useState("");
  const [bookSearch, setBookSearch]               = useState("");

  useEffect(() => {
    if (!user) {
      Swal.fire({ icon: "warning", title: "Login Required", confirmButtonText: "Go to Login" })
        .then(() => navigate("/login"));
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, booksRes, requestsRes, ordersRes] = await Promise.all([
        api.get("/api/users"),
        api.get("/books"),
        api.get("/api/librarian-requests"),
        api.get("/orders").catch(() => ({ data: [] }))
      ]);
      setUsers((usersRes.data || []).map(u => ({
        ...u,
        displayName: u.displayName?.trim() || u.email?.split("@")[0] || "User",
      })));
      setBooks(booksRes.data || []);
      setLibrarianRequests(requestsRes.data || []);
      // Optional state for orders if needed for more complex logic, but we can compute inline or store it
      window.__adminOrders = ordersRes.data || [];
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(p => ({ ...p, [userId]: true }));
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers(p => p.map(u => u._id === userId ? { ...u, role: newRole } : u));
      Swal.fire("Updated!", `Role changed to ${newRole}`, "success");
    } catch {
      Swal.fire("Error", "Failed to update role", "error");
    } finally {
      setActionLoading(p => ({ ...p, [userId]: false }));
    }
  };

  // ✅ NEW: Admin can permanently delete a user
  const handleDeleteUser = async (userId, userEmail) => {
    const result = await Swal.fire({
      title: "Delete User?",
      html: `This will permanently delete <strong>${userEmail}</strong> and all their orders. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;

    setActionLoading(p => ({ ...p, [userId]: true }));
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(p => p.filter(u => u._id !== userId));
      Swal.fire("Deleted!", "User has been removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to delete user", "error");
    } finally {
      setActionLoading(p => ({ ...p, [userId]: false }));
    }
  };

  const handleLibrarianRequest = async (requestId, action, userId) => {
    setActionLoading(p => ({ ...p, [requestId]: true }));
    try {
      await api.patch(`/api/librarian-requests/${requestId}`, { status: action });
      if (action === "approved") {
        setUsers(p => p.map(u => u.uid === userId ? { ...u, role: "librarian" } : u));
      }
      setLibrarianRequests(p => p.map(r => r._id === requestId ? { ...r, status: action } : r));
      setExpandedReason(null);
      Swal.fire("Done!", `Request ${action}`, "success");
    } catch {
      Swal.fire("Error", "Failed to process request", "error");
    } finally {
      setActionLoading(p => ({ ...p, [requestId]: false }));
    }
  };

  // ✅ Admin toggle: sets adminLocked flag when unpublishing, clears it when republishing
  const handleToggleBookStatus = async (book) => {
    const newStatus = book.status === "published" ? "unpublished" : "published";
    const confirmText = newStatus === "unpublished"
      ? "This will hide the book AND lock it — librarians cannot republish it without your approval."
      : "This will make the book visible again and remove the admin lock.";

    const result = await Swal.fire({
      title: `${newStatus === "published" ? "Publish" : "Unpublish"} this book?`,
      text: confirmText,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
    });
    if (!result.isConfirmed) return;

    setActionLoading(p => ({ ...p, [book._id]: true }));
    try {
      const res = await api.patch(`/books/${book._id}`, { status: newStatus });
      const newLocked = res.data.adminLocked ?? (newStatus === "unpublished");
      setBooks(p => p.map(b => b._id === book._id ? { ...b, status: newStatus, adminLocked: newLocked } : b));
      Swal.fire("Updated!", `Book is now ${newStatus}${newLocked ? " 🔒 (locked)" : ""}.`, "success");
    } catch {
      Swal.fire("Error", "Failed to update book status.", "error");
    } finally {
      setActionLoading(p => ({ ...p, [book._id]: false }));
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

    setActionLoading(p => ({ ...p, [bookId]: true }));
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(p => p.filter(b => b._id !== bookId));
      Swal.fire("Deleted!", "Book removed.", "success");
    } catch {
      Swal.fire("Error", "Failed to delete book", "error");
    } finally {
      setActionLoading(p => ({ ...p, [bookId]: false }));
    }
  };

  const pendingRequests = librarianRequests.filter(r => r.status === "pending").length;
  const librarianCount  = users.filter(u => u.role === "librarian").length;
  const publishedBooks  = books.filter(b => b.status === "published").length;

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredBooks = books.filter(b =>
    b.bookName?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.authorName?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // Chart data prep
  const categoryData = Object.entries(books.reduce((acc, b) => {
    const cat = b.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {})).map(([name, count]) => ({ name, count }));

  const ordersData = Object.entries((window.__adminOrders || []).reduce((acc, o) => {
    const d = new Date(o.orderDate || new Date()).toLocaleDateString();
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {})).map(([date, count]) => ({ date, count })).sort((a,b) => new Date(a.date) - new Date(b.date));

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
            <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-1">Admin</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Dashboard</h1>
            <p className="text-base-content/50 text-sm mt-1">
              Logged in as <span className="font-semibold">{user?.displayName || user?.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                <img src={user?.photoURL || "https://i.ibb.co/0s3pdnc/default-avatar.jpg"} alt="avatar" />
              </div>
            </div>
            <RoleBadge role={user?.role} />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Total Users"      value={users.length}     color="border-primary" />
          <StatCard icon="📚" label="Librarians"       value={librarianCount}   color="border-warning" />
          <StatCard icon="📖" label="Published Books"  value={publishedBooks}   color="border-success" />
          <StatCard icon="⏳" label="Pending Requests" value={pendingRequests}  color="border-error"   />
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed w-fit flex-wrap gap-1">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "users",    label: `👥 Users (${users.length})`                },
            { id: "requests", label: `📝 Requests (${librarianRequests.length})`, badge: pendingRequests },
            { id: "books",    label: `📚 Books (${books.length})`                },
          ].map(t => (
            <button
              key={t.id}
              className={`tab relative ${activeTab === t.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              {t.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-error text-error-content text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black">Dashboard Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart: Books by Category */}
              <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-xl">
                <h3 className="font-bold mb-4 text-base-content/70 uppercase text-sm tracking-widest">Books by Category</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <RTTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart: Orders over time */}
              <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-xl">
                <h3 className="font-bold mb-4 text-base-content/70 uppercase text-sm tracking-widest">Orders Over Time</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ordersData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <RTTooltip contentStyle={{borderRadius: '12px'}} />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══ USERS TAB ══ */}
        {activeTab === "users" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-black">Manage Users</h2>
              <input
                type="text" placeholder="Search by name or email…"
                className="input input-bordered input-sm rounded-xl bg-base-100 w-full sm:w-64"
                value={userSearch} onChange={e => setUserSearch(e.target.value)}
              />
            </div>
            <div className="card bg-base-100 shadow border border-base-300 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead className="bg-base-200">
                    <tr><th>#</th><th>User</th><th className="hidden sm:table-cell">Email</th><th>Role</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-base-content/40">No users found</td></tr>
                    ) : filteredUsers.map((u, i) => (
                      <tr key={u._id} className="hover">
                        <td className="text-base-content/40 text-sm">{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-8 rounded-full">
                                <img src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName)}&background=random&size=32`} alt="" />
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{u.displayName}</p>
                              <p className="text-xs text-base-content/50 sm:hidden truncate max-w-[120px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell text-sm text-base-content/70">{u.email}</td>
                        <td><RoleBadge role={u.role} /></td>
                        <td>
                          <div className="flex gap-1.5 flex-wrap">
                            {u.role !== "admin"     && <button onClick={() => handleRoleChange(u._id, "admin")}     disabled={actionLoading[u._id]} className="btn btn-xs btn-outline btn-error">👑 Admin</button>}
                            {u.role !== "librarian" && <button onClick={() => handleRoleChange(u._id, "librarian")} disabled={actionLoading[u._id]} className="btn btn-xs btn-outline btn-warning">📚 Librarian</button>}
                            {u.role !== "user"      && <button onClick={() => handleRoleChange(u._id, "user")}      disabled={actionLoading[u._id]} className="btn btn-xs btn-outline">Demote</button>}
                            {/* ✅ Delete user — hidden for self */}
                            {u.email !== user?.email && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.email)}
                                disabled={actionLoading[u._id]}
                                className="btn btn-xs btn-error rounded-full px-2"
                                title="Delete user"
                              >🗑</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ══ REQUESTS TAB ══ */}
        {activeTab === "requests" && (
          <section className="space-y-4">
            <h2 className="text-2xl font-black">Librarian Requests</h2>
            {librarianRequests.length === 0 ? (
              <div className="text-center py-16 text-base-content/40">
                <p className="text-5xl mb-4">📭</p><p className="font-medium">No requests yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {librarianRequests.map(r => (
                  <div key={r._id} className={`card bg-base-100 shadow border rounded-2xl overflow-hidden
                    ${r.status === "pending"  ? "border-warning/40" : ""}
                    ${r.status === "approved" ? "border-success/40" : ""}
                    ${r.status === "rejected" ? "border-error/40"   : ""}
                  `}>
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center flex-shrink-0">
                            {r.userInfo?.displayName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{r.userInfo?.displayName || "Unknown"}</p>
                            <p className="text-xs text-base-content/50 truncate max-w-[140px]">{r.userInfo?.email}</p>
                          </div>
                        </div>
                        <span className={`badge badge-sm font-semibold shrink-0
                          ${r.status === "pending"  ? "badge-warning" : ""}
                          ${r.status === "approved" ? "badge-success" : ""}
                          ${r.status === "rejected" ? "badge-error"   : ""}
                        `}>
                          {r.status === "pending" ? "⏳ Pending" : r.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                        </span>
                      </div>

                      {/* Reason box */}
                      <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                        <p className="text-xs font-bold text-base-content/40 uppercase tracking-wide mb-2">📝 Reason for applying</p>
                        <p className={`text-sm text-base-content/80 leading-relaxed ${r.reason?.length > 120 ? "line-clamp-3" : ""}`}>
                          {r.reason || <span className="italic text-base-content/40">No reason provided</span>}
                        </p>
                        {r.reason?.length > 120 && (
                          <button onClick={() => setExpandedReason(r)} className="text-xs text-primary font-semibold mt-2 hover:underline">
                            Read full reason →
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-base-content/40">
                        📅 {new Date(r.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>

                      {r.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleLibrarianRequest(r._id, "approved", r.userId)} disabled={actionLoading[r._id]} className="btn btn-sm btn-success flex-1 rounded-full">
                            {actionLoading[r._id] ? <span className="loading loading-spinner loading-xs"></span> : "✅ Approve"}
                          </button>
                          <button onClick={() => handleLibrarianRequest(r._id, "rejected", r.userId)} disabled={actionLoading[r._id]} className="btn btn-sm btn-error btn-outline flex-1 rounded-full">
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══ BOOKS TAB ══ */}
        {activeTab === "books" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-black">Manage All Books</h2>
              <input
                type="text" placeholder="Search books…"
                className="input input-bordered input-sm rounded-xl bg-base-100 w-full sm:w-64"
                value={bookSearch} onChange={e => setBookSearch(e.target.value)}
              />
            </div>
            {filteredBooks.length === 0 ? (
              <div className="text-center py-16 text-base-content/40">
                <p className="text-5xl mb-4">📭</p><p className="font-medium">No books found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBooks.map(book => (
                  <div key={book._id} className="group card bg-base-100 shadow border border-base-300 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                    <figure className="relative overflow-hidden h-48">
                      <img
                        src={book.bookImage} alt={book.bookName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.src = "https://via.placeholder.com/400x600?text=No+Image"; }}
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                        <span className={`badge badge-sm font-semibold ${book.status === "published" ? "badge-success" : "badge-warning"}`}>
                          {book.status === "published" ? "✅ Live" : "🚫 Hidden"}
                        </span>
                        {/* ✅ Show lock badge if admin locked this book */}
                        {book.adminLocked && (
                          <span className="badge badge-sm badge-error font-semibold">🔒 Locked</span>
                        )}
                      </div>
                    </figure>
                    <div className="card-body p-4 space-y-1">
                      <h3 className="font-black text-sm line-clamp-2 group-hover:text-primary transition-colors">{book.bookName}</h3>
                      <p className="text-xs text-base-content/50">{book.authorName}</p>
                      <p className="text-xs text-base-content/40 truncate">by {book.addedBy}</p>
                      <p className="text-primary font-black text-sm">${book.price}</p>

                      {/* ✅ Admin toggle always works — and shows lock/unlock label */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleToggleBookStatus(book)}
                          disabled={actionLoading[book._id]}
                          className={`btn btn-xs flex-1 rounded-full ${book.status === "published" ? "btn-warning" : "btn-success"}`}
                        >
                          {actionLoading[book._id]
                            ? <span className="loading loading-spinner loading-xs"></span>
                            : book.status === "published"
                              ? "🔒 Unpublish"
                              : book.adminLocked ? "🔓 Unlock & Publish" : "✅ Publish"
                          }
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          disabled={actionLoading[book._id]}
                          className="btn btn-xs btn-outline btn-error rounded-full px-3"
                        >🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {/* Full-reason Modal */}
      {expandedReason && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedReason(null)}>
          <div className="bg-base-100 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-base-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-black text-lg">Full Application Reason</h3>
                <p className="text-sm text-base-content/50">{expandedReason.userInfo?.displayName} · {expandedReason.userInfo?.email}</p>
              </div>
              <button onClick={() => setExpandedReason(null)} className="btn btn-ghost btn-sm btn-circle">✕</button>
            </div>
            <div className="bg-base-200 rounded-2xl p-5 border border-base-300 mb-4">
              <p className="text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap">{expandedReason.reason}</p>
            </div>
            <p className="text-xs text-base-content/40 mb-4">
              📅 {new Date(expandedReason.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            {expandedReason.status === "pending" && (
              <div className="flex gap-3">
                <button onClick={() => handleLibrarianRequest(expandedReason._id, "approved", expandedReason.userId)} className="btn btn-success flex-1 rounded-full">✅ Approve</button>
                <button onClick={() => handleLibrarianRequest(expandedReason._id, "rejected", expandedReason.userId)} className="btn btn-error btn-outline flex-1 rounded-full">❌ Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;