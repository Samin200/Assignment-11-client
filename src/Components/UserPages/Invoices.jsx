import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../Context/AuthContext";
import api from "../../utilitys/api";

const Invoices = () => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    api.get(`/orders?email=${user.email}&paymentStatus=paid`)  // ✅ relative URL via api
      .then(res => setInvoices(res.data || []))
      .catch(err => console.error("Failed to fetch invoices:", err))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const total = invoices.reduce((sum, inv) => sum + (Number(inv.price) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-2">Account</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Invoices</h1>
            <p className="text-base-content/50 text-sm mt-1">{invoices.length} paid order{invoices.length !== 1 ? "s" : ""}</p>
          </div>
          {invoices.length > 0 && (
            <div className="bg-base-100 rounded-2xl border border-base-300 shadow px-5 py-3 text-right">
              <p className="text-xs text-base-content/50 font-medium">Total Spent</p>
              <p className="text-2xl font-black text-primary">${total.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Empty */}
        {invoices.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="text-7xl opacity-20">🧾</p>
            <p className="text-xl font-bold">No invoices yet</p>
            <p className="text-base-content/50">Your invoices will appear here after successful payments.</p>
            <Link to="/books" className="btn btn-primary rounded-full mt-2">Browse Books</Link>
          </div>
        )}

        {/* Invoice cards */}
        {invoices.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block card bg-base-100 shadow border border-base-300 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead className="bg-base-200">
                    <tr>
                      <th>#</th>
                      <th>Book</th>
                      <th>Amount</th>
                      <th>Paid On</th>
                      <th>Invoice ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => (
                      <tr key={inv._id} className="hover">
                        <td className="text-base-content/40 text-sm">{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            {inv.bookImage && (
                              <img src={inv.bookImage} alt={inv.bookName}
                                className="w-8 h-11 object-cover rounded-lg border border-base-200 flex-shrink-0"
                                onError={e => { e.target.style.display = "none"; }} />
                            )}
                            <span className="font-semibold text-sm line-clamp-1">{inv.bookName || "Unknown Book"}</span>
                          </div>
                        </td>
                        <td className="font-black text-success">${Number(inv.price || 0).toFixed(2)}</td>
                        <td className="text-sm text-base-content/70">
                          {inv.paidAt
                            ? new Date(inv.paidAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                            : "—"
                          }
                        </td>
                        <td>
                          <code className="text-xs bg-base-200 px-2 py-1 rounded-lg font-mono">
                            {inv.stripeSessionId
                              ? inv.stripeSessionId.slice(-12).toUpperCase()
                              : inv._id.toString().slice(-10).toUpperCase()
                            }
                          </code>
                        </td>
                        <td><span className="badge badge-success badge-sm font-semibold">✅ Paid</span></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-base-200 font-black">
                      <td colSpan={2} className="text-right pr-4">Total</td>
                      <td className="text-success">${total.toFixed(2)}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-4">
              {invoices.map((inv, i) => (
                <div key={inv._id} className="card bg-base-100 shadow border border-base-300 rounded-2xl">
                  <div className="card-body p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {inv.bookImage && (
                        <img src={inv.bookImage} alt={inv.bookName}
                          className="w-10 h-14 object-cover rounded-lg border border-base-200 flex-shrink-0"
                          onError={e => { e.target.style.display = "none"; }} />
                      )}
                      <div>
                        <p className="font-black text-sm line-clamp-2">{inv.bookName || "Unknown Book"}</p>
                        <span className="badge badge-success badge-xs font-semibold mt-1">✅ Paid</span>
                      </div>
                      <p className="ml-auto font-black text-success">${Number(inv.price || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-xs text-base-content/50 pt-2 border-t border-base-200">
                      <span>
                        {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </span>
                      <code className="bg-base-200 px-2 py-0.5 rounded font-mono">
                        #{(inv.stripeSessionId || inv._id.toString()).slice(-8).toUpperCase()}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-base-content/40 text-center">
              Invoice ID is your Stripe payment session reference. Keep it for your records.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Invoices;