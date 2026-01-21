import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { auth } from "../../Firebase/firebase.init";
import Swal from "sweetalert2";

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    axios
      .get(`http://localhost:5020/books/${id}`)
      .then((res) => {
        setBook(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error loading book:", err);
        setLoading(false);
      });
  }, [id]);

  const handleOrder = async () => {
    // Validation: required fields
    if (!phone.trim() || !address.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Info",
        text: "Please provide both phone number and address.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    // Phone must be numbers only
    if (!/^\d+$/.test(phone.trim())) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone",
        text: "Phone number must contain only digits.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    const orderData = {
      bookId: book._id,
      bookName: book.bookName,
      price: book.price,
      userName: user.displayName || "Guest",
      email: user.email,
      phone: phone.trim(),
      address: address.trim(),
      status: "pending",
      paymentStatus: "unpaid",
      orderDate: new Date(),
    };

    try {
      const res = await axios.post("http://localhost:5020/orders", orderData);

      if (res.data.orderId) {
        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: "Your order has been successfully placed. Check My Orders to pay.",
          confirmButtonColor: "#6366f1",
        });
        setOpenModal(false);
        setPhone("");
        setAddress("");
      }
    } catch (err) {
      console.error("Order error:", err);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: err.response?.data?.error || "Something went wrong while placing the order.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center h-[95vh] flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6 text-center h-[95vh] flex justify-center items-center">
        Book not found.
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <Link to="/books" className="text-primary underline">
          ← Back to All Books
        </Link>

        <div className="mt-6 bg-base-200 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src={book.bookImage}
              alt={book.bookName}
              className="w-full h-80 object-cover rounded-lg"
            />

            <div>
              <h1 className="text-3xl font-bold">{book.bookName}</h1>
              <p className="text-lg opacity-80 mt-1">by {book.authorName}</p>
              <p className="mt-4 opacity-90">{book.description}</p>

              <div className="mt-6 space-y-2">
                <p>
                  <strong>Category:</strong> {book.category}
                </p>
                <p>
                  <strong>Price:</strong> ${book.price}
                </p>
                <p>
                  <strong>Pages:</strong> {book.pages}
                </p>
                <p>
                  <strong>Rating:</strong> ⭐ {book.rating}
                </p>
              </div>

              <button
                className="btn btn-primary mt-6"
                onClick={() => {
                  if (!user) {
                    Swal.fire({
                      title: "Login Required",
                      text: "You must log in to place an order.",
                      icon: "warning",
                      confirmButtonText: "OK",
                    });
                    return;
                  }
                  setOpenModal(true);
                }}
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-base-100 p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Place Order</h2>

            <div className="space-y-3">
              <input
                type="text"
                value={user.displayName || "Guest"}
                readOnly
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={user.email}
                readOnly
                className="input input-bordered w-full"
              />

              <input
                type="text"
                placeholder="Phone Number (digits only)"
                value={phone}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) { // Only allow digits
                    setPhone(e.target.value);
                  }
                }}
                className="input input-bordered w-full"
              />

              <textarea
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="textarea textarea-bordered w-full"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button className="btn" onClick={() => setOpenModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleOrder}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}