import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import api from "../../utilitys/api";
import { AuthContext } from "../../Context/AuthContext";
import Swal from "sweetalert2";

const BecomeLibrarian = () => {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [reason, setReason]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null); // null | "pending" | "approved" | "rejected"

  useEffect(() => {
    if (!user) {
      Swal.fire("Login Required", "You need to login first", "warning").then(() => navigate("/login"));
      return;
    }
    // If already a librarian or admin, no need to apply
    if (user.role === "librarian" || user.role === "admin") {
      navigate("/librarian-dashboard");
      return;
    }
    // Check existing request
    checkExistingRequest();
  }, [user]);

  const checkExistingRequest = async () => {
    try {
      const res = await api.get(`/api/my-librarian-request?uid=${user.uid}`);
      setRequestStatus(res.data?.status || null);
    } catch {
      setRequestStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleRequest = async () => {
    if (reason.trim().length < 10) {
      return Swal.fire("Too short", "Please explain your reason (min 10 characters).", "warning");
    }
    setLoading(true);
    try {
      await api.post("/api/become-librarian", {
        userId: user.uid,
        reason: reason.trim(),
        userInfo: {
          displayName: user.displayName || user.email,
          email:       user.email,
          photoURL:    user.photoURL || "",
        },
      });
      setRequestStatus("pending");
      Swal.fire({ icon: "success", title: "Request Submitted!", text: "We'll notify you once reviewed.", timer: 2500, showConfirmButton: false });
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong. Try again.";
      if (msg.toLowerCase().includes("pending")) setRequestStatus("pending");
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const charCount = reason.trim().length;

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="card bg-base-100 shadow border border-base-300 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 sm:p-10 space-y-5 flex flex-col justify-center">
              <div>
                <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-2">Opportunity</p>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Become a<br />Librarian
                </h1>
              </div>
              <p className="text-base-content/60 leading-relaxed">
                Join BookCourier as a librarian. Add books, manage orders, and help readers across the community get access to great reads — from the comfort of their home.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Add & manage books", "Librarian dashboard", "Manage orders", "Grow your library"].map(tag => (
                  <span key={tag} className="badge badge-primary badge-outline font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="hidden md:block overflow-hidden max-h-72">
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
                alt="Library"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: "1", icon: "✍️", title: "Apply",    desc: "Fill the form below with your reason." },
            { step: "2", icon: "👀", title: "Review",   desc: "Admin reviews your application." },
            { step: "3", icon: "✅", title: "Approved", desc: "Get notified and your role is updated." },
            { step: "4", icon: "🚀", title: "Go live",  desc: "Start adding books and managing orders." },
          ].map(s => (
            <div key={s.step} className="card bg-base-100 shadow border border-base-300 rounded-2xl">
              <div className="card-body p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-black flex items-center justify-center flex-shrink-0">{s.step}</div>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-black">{s.title}</h3>
                <p className="text-sm text-base-content/60">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status states */}
        {requestStatus === "pending" && (
          <div className="card bg-warning/10 border border-warning/30 shadow rounded-2xl">
            <div className="card-body p-6 flex-row items-center gap-5">
              <span className="text-5xl">⏳</span>
              <div>
                <h2 className="font-black text-lg">Request Under Review</h2>
                <p className="text-base-content/60 text-sm mt-1">Your application is pending admin approval. We'll update your role automatically once approved — no action needed.</p>
              </div>
            </div>
          </div>
        )}

        {requestStatus === "rejected" && (
          <div className="card bg-error/10 border border-error/30 shadow rounded-2xl">
            <div className="card-body p-6 flex-row items-center gap-5">
              <span className="text-5xl">❌</span>
              <div>
                <h2 className="font-black text-lg">Previous Request Rejected</h2>
                <p className="text-base-content/60 text-sm mt-1 mb-3">Your last request was not approved. You're welcome to submit a new one with more detail.</p>
                <button onClick={() => setRequestStatus(null)} className="btn btn-error btn-outline btn-sm rounded-full">
                  Submit New Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Application form */}
        {(!requestStatus || requestStatus === "rejected") && (
          <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
            <div className="card-body p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="font-black text-xl">Submit Your Application</h2>
                <p className="text-base-content/50 text-sm mt-1">Tell us why you'd like to become a librarian — be genuine and specific.</p>
              </div>

              {/* Applying as */}
              <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl border border-base-300">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=random&size=36`}
                    alt="you" className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">{user?.displayName || "User"}</p>
                  <p className="text-xs text-base-content/50">{user?.email}</p>
                </div>
                <span className="ml-auto badge badge-sm badge-success">Applying</span>
              </div>

              {/* Textarea */}
              <div className="form-control">
                <label className="label py-0 mb-2">
                  <span className="label-text font-semibold">Your Reason <span className="text-error">*</span></span>
                  <span className={`label-text-alt font-medium ${charCount < 10 ? "text-error" : "text-success"}`}>
                    {charCount} / 10 min
                  </span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="E.g. I have 5 years of experience managing a local bookstore and want to bring that expertise to BookCourier…"
                  rows={6}
                  className="textarea textarea-bordered w-full rounded-xl resize-none focus:textarea-primary"
                />
                <label className="label py-0 mt-1">
                  <span className="label-text-alt text-base-content/40">Admins read this carefully. Be honest and specific about your motivation and background.</span>
                </label>
              </div>

              <button
                onClick={handleRequest}
                disabled={loading || charCount < 10}
                className="btn btn-primary rounded-full px-8 gap-2 w-full sm:w-auto"
              >
                {loading
                  ? <><span className="loading loading-spinner loading-xs"></span> Submitting…</>
                  : "🎓 Submit Application"
                }
              </button>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="card bg-primary/5 border border-primary/20 shadow rounded-2xl">
          <div className="card-body p-6 sm:p-8">
            <h2 className="font-black text-xl mb-4 text-center">Why Join as a Librarian?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              {[
                { icon: "📚", title: "Full Inventory Control", desc: "Add, edit, publish or unpublish books anytime." },
                { icon: "📦", title: "Manage Orders",          desc: "Track and update order statuses for your books." },
                { icon: "📈", title: "Grow Your Library",      desc: "Build your personal digital library and reach readers." },
              ].map(b => (
                <div key={b.title} className="space-y-2">
                  <span className="text-4xl">{b.icon}</span>
                  <h3 className="font-black text-sm">{b.title}</h3>
                  <p className="text-xs text-base-content/60">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BecomeLibrarian;