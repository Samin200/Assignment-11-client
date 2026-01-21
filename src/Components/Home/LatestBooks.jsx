// src/Components/Home/LatestBooks.jsx
import { Link } from "react-router"; // ← Fixed import

export default function LatestBooks({ latestBooks = [] }) {
  if (latestBooks.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl text-gray-500">No books available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-base-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
          <h3 className="text-3xl font-bold text-primary mb-4 sm:mb-0">
            Latest Books
          </h3>
          <Link
            to="/books"
            className="text-lg text-primary hover:underline font-medium flex items-center gap-2"
          >
            View All Books →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestBooks.map((book) => (
            <article
              key={book._id}
              className="group bg-base-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-base-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={book.bookImage}
                  alt={book.bookName}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x600?text=No+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6">
                <h4 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {book.bookName}
                </h4>
                <p className="text-base-content/70 mb-3">
                  by <span className="font-medium">{book.authorName}</span>
                </p>
                <p className="text-sm text-base-content/60 line-clamp-3 mb-4">
                  {book.description || "A captivating read from our collection."}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-success">
                    ${book.price}
                  </span>
                  <Link
                    to={`/book/${book._id}`}
                    className="btn btn-primary btn-sm shadow-md"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}