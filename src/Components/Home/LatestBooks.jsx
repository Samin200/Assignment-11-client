import { Link } from "react-router";

export default function LatestBooks({ latestBooks = [] }) {
  if (latestBooks.length === 0) {
    return (
      <section className="py-20 text-center">
        <p className="text-xl opacity-40">No books available yet.</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-base-100">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">Fresh Arrivals</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Latest Books</h2>
          </div>
          <Link
            to="/books"
            className="group flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all duration-200"
          >
            Browse all books
            <span className="text-xl group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>

        {/* ── Book grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestBooks.map((book, i) => (
            <article
              key={book._id}
              className="group relative bg-base-200 rounded-2xl overflow-hidden border border-base-300
                         hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1
                         transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Cover image */}
              <div className="relative overflow-hidden h-64">
                <img
                  src={book.bookImage}
                  alt={book.bookName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.src = "https://via.placeholder.com/400x600?text=No+Image"; }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Price badge */}
                <div className="absolute top-3 right-3 bg-primary text-primary-content text-sm font-black
                                px-3 py-1 rounded-full shadow-lg">
                  ${book.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-black text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {book.bookName}
                </h3>
                <p className="text-sm text-base-content/50 mb-3 font-medium">
                  {book.authorName}
                </p>
                <p className="text-sm text-base-content/60 line-clamp-2 mb-5 leading-relaxed">
                  {book.description || "A captivating read from our curated collection."}
                </p>

                <Link
                  to={`/book/${book._id}`}
                  className="btn btn-primary btn-sm rounded-full w-full shadow hover:shadow-primary/30
                             hover:-translate-y-0.5 transition-all duration-200"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
