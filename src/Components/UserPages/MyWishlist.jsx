import { useEffect, useState, useContext } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import api from "../../utilitys/api";
import { AuthContext } from "../../Context/AuthContext";

export default function MyWishlist() {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get(`/wishlists/${user.email}`);
      setWishlist(res.data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`/wishlists/${id}`);
      setWishlist(wishlist.filter(item => item._id !== id));
      Swal.fire({
        icon: "success",
        title: "Removed",
        text: "Book removed from your wishlist.",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to remove",
        text: err.response?.data?.error || "Something went wrong."
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Wishlist ❤️</h1>
          <p className="text-base-content/50 mt-2">Books you've saved for later</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-base-100 rounded-3xl border border-base-300">
            <p className="text-6xl mb-4">📚</p>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-base-content/50 mb-6">Start exploring and save your favorite books here!</p>
            <Link to="/books" className="btn btn-primary rounded-full min-w-[200px]">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(item => (
              <div key={item._id} className="bg-base-100 rounded-2xl p-5 border border-base-300 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <img 
                    src={item.bookImage} 
                    alt={item.bookName} 
                    className="w-24 h-32 object-cover rounded-xl border border-base-200"
                    onError={e => { e.target.src = "https://via.placeholder.com/100x150?text=No+Image"; }}
                  />
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.bookName}</h3>
                      <p className="text-primary font-black mt-1">${item.price}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Link 
                    to={`/book/${item.bookId}`} 
                    className="btn btn-outline btn-sm flex-1 rounded-full"
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={() => handleRemove(item._id)}
                    className="btn btn-outline btn-error btn-sm rounded-full px-4"
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
