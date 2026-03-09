import { useState, useContext, useEffect } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../Context/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "../../Firebase/firebase.init";
import Swal from "sweetalert2";
import api from "../../utilitys/api";
import { PieChart, Pie, Cell, Tooltip as RTTooltip, Legend as RTLegend, ResponsiveContainer } from "recharts";

const MyProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName]           = useState(user?.displayName || "");
  const [image, setImage]         = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.photoURL || "");
  const [loading, setLoading]     = useState(false);
  const [stats, setStats]         = useState({ orders: 0, paid: 0, books: 0 });
  const [userOrders, setUserOrders] = useState([]);

  // ── Load quick stats ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.email) return;
    const fetchStats = async () => {
      try {
        const [ordersRes] = await Promise.all([
          api.get(`/orders?email=${user.email}`),
        ]);
        const orders = ordersRes.data || [];
        setUserOrders(orders);
        setStats({
          orders: orders.length,
          paid:   orders.filter(o => o.paymentStatus === "paid").length,
          books:  0, // can extend later
        });
      } catch {}
    };
    fetchStats();

    // Fetch librarian's book count
    if (user.role === "librarian" || user.role === "admin") {
      api.get(`/books?addedBy=${user.email}`).then(res => {
        setStats(prev => ({ ...prev, books: res.data?.length || 0 }));
      }).catch(() => {});
    }
  }, [user?.email]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return Swal.fire("Oops", "Name cannot be empty", "warning");

    setLoading(true);
    let photoURL = user?.photoURL;

    try {
      if (image) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(image);
          reader.onload  = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
        });

        const res = await api.post("/api/upload-image", { image: base64 });
        photoURL = res.data.url;
      }

      await updateProfile(auth.currentUser, { displayName: name.trim(), photoURL });
      setUser(prev => ({ ...prev, displayName: name.trim(), photoURL }));
      setPreviewUrl(photoURL);
      Swal.fire({ icon: "success", title: "Profile Updated!", timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire("Error", "Failed to save profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = {
    admin:     { label: "Administrator", color: "badge-error",   icon: "👑" },
    librarian: { label: "Librarian",     color: "badge-warning", icon: "📚" },
    user:      { label: "Member",        color: "badge-success", icon: "👤" },
  };
  const meta = roleMeta[user?.role] || roleMeta.user;

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-2">Account</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Avatar + info ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Avatar card */}
            <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
              <div className="card-body items-center p-6 text-center space-y-4">
                {/* Avatar */}
                <label className="cursor-pointer group relative">
                  <div className="w-28 h-28 rounded-full ring-4 ring-primary ring-offset-2 ring-offset-base-100 overflow-hidden">
                    <img
                      src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=random&size=112`}
                      alt="Profile"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <span className="text-white text-xs font-semibold">Change</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                <div>
                  <h2 className="font-black text-xl">{user?.displayName || "User"}</h2>
                  <p className="text-sm text-base-content/50 truncate max-w-[180px]">{user?.email}</p>
                  <span className={`badge badge-sm font-semibold mt-2 ${meta.color}`}>{meta.icon} {meta.label}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-base-200">
                  <div className="text-center">
                    <p className="text-2xl font-black">{stats.orders}</p>
                    <p className="text-xs text-base-content/50">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black">{stats.paid}</p>
                    <p className="text-xs text-base-content/50">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
              <div className="card-body p-4 space-y-1">
                <p className="text-xs font-bold text-base-content/40 uppercase tracking-wide px-2 mb-2">Quick Links</p>
                {[
                  { to: "/my-orders", icon: "📦", label: "My Orders" },
                  { to: "/invoices",  icon: "🧾", label: "Invoices"  },
                  ...(user?.role === "librarian" || user?.role === "admin"
                    ? [{ to: "/add-book", icon: "➕", label: "Add Book" },
                       { to: "/librarian-dashboard", icon: "🗂", label: "My Dashboard" }]
                    : [{ to: "/become-librarian", icon: "🎓", label: "Become a Librarian" }]
                  ),
                  ...(user?.role === "admin" ? [{ to: "/admin-dashboard", icon: "⚙️", label: "Admin Dashboard" }] : []),
                ].map(link => (
                  <Link key={link.to} to={link.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-200 transition-colors text-sm font-medium">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                    <span className="ml-auto text-base-content/30">›</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Edit form ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
              <div className="card-body p-6 space-y-5">
                <h2 className="font-black text-lg">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Avatar file upload (also shown in form) */}
                  <div className="form-control">
                    <label className="label py-0 mb-2">
                      <span className="label-text font-semibold">Profile Photo</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <img
                        src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=random&size=64`}
                        alt="preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-base-300"
                      />
                      <label className="btn btn-outline btn-sm rounded-full gap-2 cursor-pointer">
                        📷 Change Photo
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="form-control">
                    <label className="label py-0 mb-1">
                      <span className="label-text font-semibold">Display Name</span>
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your full name" className="input input-bordered w-full rounded-xl" required />
                  </div>

                  {/* Email (read-only) */}
                  <div className="form-control">
                    <label className="label py-0 mb-1">
                      <span className="label-text font-semibold">Email</span>
                      <span className="label-text-alt text-base-content/40">Cannot be changed here</span>
                    </label>
                    <input type="email" value={user?.email || ""} disabled className="input input-bordered w-full rounded-xl opacity-60 cursor-not-allowed" />
                  </div>

                  {/* Role (read-only) */}
                  <div className="form-control">
                    <label className="label py-0 mb-1">
                      <span className="label-text font-semibold">Role</span>
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl border border-base-300">
                      <span className="text-xl">{meta.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{meta.label}</p>
                        <p className="text-xs text-base-content/50 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading} className="btn btn-primary rounded-full px-8 gap-2 flex-1">
                      {loading
                        ? <><span className="loading loading-spinner loading-xs"></span> Saving…</>
                        : "💾 Save Changes"
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Account info card */}
            <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
              <div className="card-body p-5">
                <h2 className="font-black text-sm text-base-content/50 uppercase tracking-wide mb-3">Account Info</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-base-content/40 mb-0.5">UID</p>
                    <p className="font-mono text-xs truncate">{user?.uid?.slice(0, 12)}…</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/40 mb-0.5">Provider</p>
                    <p className="font-semibold capitalize">{user?.providerData?.[0]?.providerId?.replace(".com", "") || "email"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/40 mb-0.5">Email Verified</p>
                    <p className="font-semibold">{user?.emailVerified ? "✅ Yes" : "❌ No"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Chart */}
            {userOrders.length > 0 && (
              <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
                <div className="card-body p-5">
                  <h2 className="font-black text-sm text-base-content/50 uppercase tracking-wide mb-3">Order Status Overview</h2>
                  <div className="h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            userOrders.reduce((acc, order) => {
                              acc[order.status] = (acc[order.status] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.keys(
                            userOrders.reduce((acc, order) => {
                              acc[order.status] = (acc[order.status] || 0) + 1;
                              return acc;
                            }, {})
                          ).map((status, index) => {
                            const colors = { pending: "#fbbd23", shipped: "#3abff8", delivered: "#36d399", cancelled: "#f87272" };
                            return <Cell key={`cell-${index}`} fill={colors[status] || "#8884d8"} />;
                          })}
                        </Pie>
                        <RTTooltip />
                        <RTLegend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;