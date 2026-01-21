import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";

const Invoices = () => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchPaidOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:5020/orders?email=${user.email}&paymentStatus=paid`
        );
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-xl text-gray-500">No paid orders yet.</p>
        <p className="text-gray-400 mt-2">Your invoices will appear here after successful payment.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-primary">My Invoices</h2>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-primary text-primary-content">
              <th>Book</th>
              <th>Amount</th>
              <th>Paid On</th>
              <th>Invoice ID</th>
            </tr>
          </thead>
          <tbody>
  {invoices.map((inv) => (
    <tr key={inv._id} className="hover">
      <td className="font-medium">{inv.bookName || "Unknown Book"}</td>
      <td className="font-semibold text-success">
        ${inv.price ? Number(inv.price).toFixed(2) : "0.00"}
      </td>
      <td>
        {inv.paidAt 
          ? new Date(inv.paidAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A"
        }
      </td>
      <td>
        <code className="text-xs bg-base-200 px-2 py-1 rounded">
          {inv.stripeSessionId || inv._id.toString().slice(-8).toUpperCase()}
        </code>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Invoice ID is your Stripe payment session reference. Keep it for records.
      </p>
    </div>
  );
};

export default Invoices;