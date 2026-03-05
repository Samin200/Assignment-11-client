import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import api from "../../utilitys/api";

export default function HeroBanner() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/books");
        const topRated = res.data
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        setFeaturedBooks(topRated);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <section className="h-[85vh] bg-base-200 animate-pulse flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </section>
    );
  }

  if (featuredBooks.length === 0) {
    return (
      <section className="h-[85vh] flex items-center justify-center">
        <p className="text-xl opacity-50">No featured books yet.</p>
      </section>
    );
  }

  return (
    <section className="relative">
      <style>{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: hsl(var(--p));
          background: hsl(var(--b1) / 0.8);
          backdrop-filter: blur(8px);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid hsl(var(--p) / 0.3);
        }
        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 16px;
          font-weight: 900;
        }
        .hero-swiper .swiper-pagination-bullet {
          background: hsl(var(--p));
          opacity: 0.4;
          width: 8px;
          height: 8px;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 28px;
          border-radius: 4px;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp 0.7s ease forwards; }
        .slide-up-delay { animation: slideUp 0.7s 0.15s ease both; }
        .slide-up-delay2 { animation: slideUp 0.7s 0.3s ease both; }
      `}</style>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        loop
        className="hero-swiper"
      >
        {featuredBooks.map((book, index) => (
          <SwiperSlide key={book._id}>
            <div className="relative min-h-[85vh] grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-base-100">

              {/* ── Decorative background blobs ── */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
              </div>

              {/* ── Text side ── */}
              <div className={`relative z-10 flex flex-col justify-center px-10 md:px-16 lg:px-24 py-16 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                {/* Rating pill */}
                <div className="slide-up flex items-center gap-2 mb-6 w-fit px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-yellow-500 text-sm">★★★★★</span>
                  <span className="text-sm font-semibold text-primary">{book.rating ? `${book.rating} / 5` : "New Arrival"}</span>
                </div>

                {/* Title */}
                <h1 className="slide-up-delay text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 tracking-tight">
                  {book.bookName}
                </h1>

                {/* Author */}
                <p className="slide-up-delay text-lg md:text-xl text-base-content/60 mb-5">
                  by <span className="text-primary font-semibold">{book.authorName}</span>
                </p>

                {/* Description */}
                <p className="slide-up-delay2 text-base text-base-content/70 leading-relaxed line-clamp-3 mb-8 max-w-md">
                  {book.description || "One of our highest-rated books — available for delivery now."}
                </p>

                {/* Price + CTA */}
                <div className="slide-up-delay2 flex items-center gap-6">
                  <span className="text-3xl font-black text-primary">${book.price}</span>
                  <Link
                    to={`/book/${book._id}`}
                    className="btn btn-primary btn-lg rounded-full px-8 shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* ── Book cover side ── */}
              <div className={`relative flex items-center justify-center p-10 md:p-16 ${index % 2 === 1 ? "md:order-1" : ""}`}>
                {/* Glow behind book */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
                </div>

                {/* Book image with 3D tilt shadow */}
                <div className="relative z-10 group">
                  <div className="absolute -bottom-4 left-4 right-4 h-16 bg-black/20 blur-xl rounded-full" />
                  <img
                    src={book.bookImage}
                    alt={book.bookName}
                    className="relative w-64 md:w-72 lg:w-80 h-auto object-cover rounded-xl shadow-2xl
                               border-4 border-base-100
                               group-hover:rotate-1 group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = "https://via.placeholder.com/400x600?text=No+Image"; }}
                  />
                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
