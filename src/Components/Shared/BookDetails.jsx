import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import api from "../../utilitys/api";
import { AuthContext } from "../../Context/AuthContext";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [book, setBook]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [phone, setPhone]         = useState("");
  const [address, setAddress]     = useState("");
  const [placing, setPlacing]     = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Fetch book details and reviews
    Promise.all([
      api.get(`/books/${id}`),
      api.get(`/reviews/${id}`).catch(() => ({ data: [] }))
    ])
      .then(([bookRes, reviewsRes]) => {
        setBook(bookRes.data);
        setReviews(reviewsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Check if user has ordered this book
    if (user?.email && id) {
      api.get(`/orders?email=${user.email}`)
        .then(res => {
          const hasOrdered = res.data.some(order => order.bookId === id);
          setCanReview(hasOrdered);
        })
        .catch(err => console.error("Failed to check orders", err));
    }
  }, [user, id]);

  const handleOrder = async () => {
    if (!phone.trim() || !address.trim()) {
      return Swal.fire({ icon: "error", title: "Missing Info", text: "Please fill in phone and address." });
    }
    if (!/^\d+$/.test(phone.trim())) {
      return Swal.fire({ icon: "error", title: "Invalid Phone", text: "Phone must contain digits only." });
    }

    setPlacing(true);
    try {
      const res = await api.post("/orders", {
        bookId:       book._id,
        bookName:     book.bookName,
        bookImage:    book.bookImage,
        price:        book.price,
        userName:     user.displayName || "Guest",
        email:        user.email,
        phone:        phone.trim(),
        address:      address.trim(),
        status:       "pending",
        paymentStatus:"unpaid",
        orderDate:    new Date(),
      });

      if (res.data.orderId) {
        setOpenModal(false);
        setPhone(""); setAddress("");
        Swal.fire({
          icon: "success",
          title: "Order Placed! 🎉",
          text: "Go to My Orders to complete payment.",
          confirmButtonText: "View My Orders",
          showCancelButton: true,
          cancelButtonText: "Stay here",
        }).then(r => { if (r.isConfirmed) navigate("/my-orders"); });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Order Failed", text: err.response?.data?.error || "Something went wrong." });
    } finally {
      setPlacing(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      return Swal.fire({
        title: "Login Required",
        text: "You need to log in to add items to your wishlist.",
        icon: "warning",
        confirmButtonText: "Go to Login",
        showCancelButton: true,
      }).then(r => { if (r.isConfirmed) navigate("/login"); });
    }

    setAddingWishlist(true);
    try {
      await api.post("/wishlists", {
        userId:       user.email,
        bookId:       book._id,
        bookName:     book.bookName,
        bookImage:    book.bookImage,
        price:        book.price,
        addedAt:      new Date(),
      });
      Swal.fire({
        icon: "success",
        title: "Added to Wishlist! ❤️",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed to Add", text: err.response?.data?.error || "Something went wrong." });
    } finally {
      setAddingWishlist(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews", {
        bookId: id,
        userName: user.displayName || "User",
        userImage: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || "U"}`,
        rating: reviewRating,
        comment: reviewText.trim(),
        date: new Date()
      });
      // Optionally re-fetch reviews or optimistic update
      setReviews([...reviews, res.data.review || { ...res.data }]);
      setReviewText("");
      setReviewRating(5);
      Swal.fire({
        icon: "success",
        title: "Review Submitted",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed to Add Review", text: err.response?.data?.error || "Error adding review" });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Stars renderer ──────────────────────────────────────────────────────────
  const Stars = ({ rating }) => {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="text-yellow-400 text-xl tracking-tight">
        {"★".repeat(full)}
        {half ? "½" : ""}
        <span className="text-base-content/20">{"★".repeat(empty)}</span>
      </span>
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-base-200">
        <p className="text-6xl">📭</p>
        <p className="text-xl font-bold">Book not found</p>
        <Link to="/books" className="btn btn-primary btn-sm rounded-full">← Back to All Books</Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-base-200">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* ── Breadcrumb ── */}
          <div className="flex items-center gap-2 text-sm text-base-content/50 mb-8 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/books" className="hover:text-primary transition-colors">All Books</Link>
            <span>/</span>
            <span className="text-base-content/80 truncate max-w-[200px]">{book.bookName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* ── Book Cover ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-base-100">
                  <img
                    src={book.bookImage}
                    alt={book.bookName}
                    className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = "https://via.placeholder.com/400x600?text=No+Image"; }}
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 justify-center flex-wrap">
                <span className={`badge badge-lg font-semibold ${book.status === "published" ? "badge-success" : "badge-warning"}`}>
                  {book.status === "published" ? "✅ Available" : "🚫 Unavailable"}
                </span>
                {book.category && (
                  <span className="badge badge-lg badge-outline border-primary/30 text-primary font-semibold">
                    {book.category}
                  </span>
                )}
              </div>
            </div>

            {/* ── Book Info ── */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {/* Title + author */}
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
                  {book.bookName}
                </h1>
                <p className="text-xl text-base-content/60">
                  by <span className="text-primary font-semibold">{book.authorName}</span>
                </p>
              </div>

              {/* Rating */}
              {book.rating > 0 && (
                <div className="flex items-center gap-3">
                  <Stars rating={book.rating} />
                  <span className="font-bold text-lg">{book.rating}</span>
                  <span className="text-base-content/40 text-sm">/ 5</span>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <p className="text-base-content/70 leading-relaxed text-base border-l-4 border-primary/30 pl-4">
                  {book.description}
                </p>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-base-100 rounded-2xl p-4 border border-base-300 text-center hover:border-primary/30 transition-colors">
                  <p className="text-2xl font-black text-primary">${book.price}</p>
                  <p className="text-xs text-base-content/50 font-medium mt-0.5">Price</p>
                </div>
                {book.pages > 0 && (
                  <div className="bg-base-100 rounded-2xl p-4 border border-base-300 text-center hover:border-primary/30 transition-colors">
                    <p className="text-2xl font-black text-primary">{book.pages}</p>
                    <p className="text-xs text-base-content/50 font-medium mt-0.5">Pages</p>
                  </div>
                )}
                {book.rating > 0 && (
                  <div className="bg-base-100 rounded-2xl p-4 border border-base-300 text-center hover:border-primary/30 transition-colors">
                    <p className="text-2xl font-black text-primary">{book.rating}★</p>
                    <p className="text-xs text-base-content/50 font-medium mt-0.5">Rating</p>
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  className="btn btn-primary btn-lg rounded-full flex-1 shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                  disabled={book.status !== "published"}
                  onClick={() => {
                    if (!user) {
                      Swal.fire({
                        title: "Login Required",
                        text: "You need to log in to place an order.",
                        icon: "warning",
                        confirmButtonText: "Go to Login",
                        showCancelButton: true,
                      }).then(r => { if (r.isConfirmed) navigate("/login"); });
                      return;
                    }
                    setOpenModal(true);
                  }}
                >
                  {book.status !== "published" ? "Currently Unavailable" : "🛒 Order Now"}
                </button>

                <Link
                  to="/books"
                  className="btn btn-outline btn-lg rounded-full hover:-translate-y-0.5 transition-all duration-200"
                >
                  ← Browse More
                </Link>

                <button
                  onClick={handleWishlist}
                  disabled={addingWishlist}
                  className="btn btn-outline btn-lg btn-secondary rounded-full hover:-translate-y-0.5 transition-all duration-200 ml-auto"
                  title="Add to Wishlist"
                >
                  {addingWishlist ? <span className="loading loading-spinner loading-xs"></span> : "❤️ Wishlist"}
                </button>
              </div>

              {book.addedBy && (
                <p className="text-xs text-base-content/30">
                  Listed by <span className="font-medium">{book.addedBy}</span>
                </p>
              )}
            </div>
          </div>

          {/* ── Reviews Section ── */}
          <div className="mt-16 border-t border-base-300 pt-10">
            <h2 className="text-3xl font-black mb-6">Reviews & Ratings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-base-content/50 italic">No reviews yet for this book.</p>
                ) : (
                  reviews.map((rev, idx) => (
                    <div key={idx} className="bg-base-100 p-5 rounded-2xl border border-base-200 flex gap-4 shadow-sm">
                      <img src={rev.userImage || "https://ui-avatars.com/api/?name=U"} alt={rev.userName} className="w-12 h-12 rounded-full ring-1 ring-primary/20" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{rev.userName}</h4>
                          <span className="text-sm text-base-content/40">{new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                        <div className="mb-2"><Stars rating={rev.rating} /></div>
                        <p className="text-base-content/80 text-sm">{rev.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Review Form */}
              <div>
                {canReview ? (
                  <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="label py-0 mb-1"><span className="label-text font-semibold">Rating</span></label>
                        <div className="rating rating-lg">
                          {[1, 2, 3, 4, 5].map(val => (
                            <input
                              key={val}
                              type="radio"
                              name="rating"
                              className="mask mask-star-2 bg-yellow-400"
                              checked={reviewRating === val}
                              onChange={() => setReviewRating(val)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="label py-0 mb-1"><span className="label-text font-semibold">Your Review</span></label>
                        <textarea
                          placeholder="What did you think about this book?"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="textarea textarea-bordered w-full h-32 resize-none rounded-xl"
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary w-full rounded-xl" disabled={submittingReview}>
                        {submittingReview ? <span className="loading loading-spinner loading-xs"></span> : "Submit Review"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 flex flex-col items-center justify-center text-center h-48">
                    <p className="text-4xl mb-2">🔒</p>
                    <p className="font-semibold text-primary">Reviews are exclusively for buyers</p>
                    <p className="text-sm text-base-content/60 mt-1">Purchase this book to leave a review.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Modal ── */}
      {openModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpenModal(false); }}
        >
          <div className="bg-base-100 rounded-3xl w-full max-w-md shadow-2xl border border-base-200 overflow-hidden">

            {/* Modal header */}
            <div className="bg-primary/10 border-b border-base-200 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Place Order</h2>
                <p className="text-sm text-base-content/50 mt-0.5 truncate max-w-[260px]">{book.bookName}</p>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* User info (read-only) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label py-0 mb-1">
                    <span className="label-text text-xs font-bold text-base-content/40 uppercase tracking-wide">Name</span>
                  </label>
                  <input
                    type="text"
                    value={user?.displayName || "Guest"}
                    readOnly
                    className="input input-bordered input-sm w-full bg-base-200 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="label py-0 mb-1">
                    <span className="label-text text-xs font-bold text-base-content/40 uppercase tracking-wide">Email</span>
                  </label>
                  <input
                    type="text"
                    value={user?.email}
                    readOnly
                    className="input input-bordered input-sm w-full bg-base-200 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="label py-0 mb-1">
                  <span className="label-text text-xs font-bold text-base-content/40 uppercase tracking-wide">
                    Phone <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Digits only — e.g. 01712345678"
                  value={phone}
                  onChange={e => { if (/^\d*$/.test(e.target.value)) setPhone(e.target.value); }}
                  className="input input-bordered w-full"
                />
              </div>

              {/* Address */}
              <div>
                <label className="label py-0 mb-1">
                  <span className="label-text text-xs font-bold text-base-content/40 uppercase tracking-wide">
                    Delivery Address <span className="text-error">*</span>
                  </span>
                </label>
                <textarea
                  placeholder="Full delivery address…"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="textarea textarea-bordered w-full h-24 resize-none"
                />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-base-content/60">Total to pay</span>
                <span className="text-2xl font-black text-primary">${book.price}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="btn btn-ghost flex-1 rounded-full"
                disabled={placing}
              >
                Cancel
              </button>
              <button
                onClick={handleOrder}
                className="btn btn-primary flex-1 rounded-full"
                disabled={placing}
              >
                {placing
                  ? <><span className="loading loading-spinner loading-xs"></span> Placing…</>
                  : "✅ Confirm Order"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}