import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import axios from "axios";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroBanner() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedBooks = async () => {
      try {
        const res = await axios.get("http://localhost:5020/books");
        const topRated = res.data
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        setFeaturedBooks(topRated);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load books:", err);
        setLoading(false);
      }
    };

    fetchTopRatedBooks();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-96 md:h-[600px] bg-base-200 rounded-2xl animate-pulse flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </div>
      </section>
    );
  }

  if (featuredBooks.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl text-gray-500">No books available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          slidesPerView={1}
          spaceBetween={0}
          className="rounded-2xl overflow-hidden shadow-2xl"
        >
          {featuredBooks.map((book, index) => (
            <SwiperSlide key={book._id}>
              <div className="grid grid-cols-1 md:grid-cols-2 items-center bg-base-200 min-h-[500px] md:min-h-[600px]">
                {/* Text Side */}
                <div className={`p-8 md:p-12 lg:p-20 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-500 text-2xl">⭐</span>
                    <span className="text-2xl font-bold">{book.rating || "New"}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    {book.bookName}
                  </h2>
                  <p className="text-xl mb-4 opacity-90">
                    by <span className="font-semibold text-primary">{book.authorName}</span>
                  </p>
                  <p className="text-lg mb-10 text-base-content/80 line-clamp-4">
                    {book.description || "One of our highest-rated books — available now."}
                  </p>

                  <p className="text-2xl font-medium text-base-content/70 mb-8">
                    ${book.price}
                  </p>

                  <Link
                    to={`/book/${book._id}`}
                    className="btn btn-primary btn-lg text-lg px-8 shadow-xl"
                  >
                    View Details
                  </Link>
                </div>

                {/* Image Side - FIXED HEIGHT & RESPONSIVE */}
                <div className={`flex justify-center items-center p-8 md:p-12 ${index % 2 === 1 ? "md:order-1" : ""}`}>
                  <div className="relative w-full max-w-lg">
                    <img
                      src={book.bookImage}
                      alt={book.bookName}
                      className="w-full h-96 md:h-[500px] lg:h-[550px] object-cover rounded-2xl shadow-2xl border-8 border-base-100"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x1200?text=No+Image";
                      }}
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}