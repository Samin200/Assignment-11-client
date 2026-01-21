import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5020/books")
      .then((res) => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error loading books:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center h-[95vh] flex justify-center items-center">Loading books...</div>;
  }

  if (books.length === 0) {
    return <div className="p-6 text-center h-[95vh] flex justify-center items-center text-gray-500">No books available yet.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Books</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Link
            to={`/book/${book._id}`}
            key={book._id}
            className="bg-base-200 p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <img
              src={book.bookImage}
              alt={book.bookName}
              className="h-52 w-full object-cover rounded"
            />
            <h2 className="text-xl font-semibold mt-3">{book.bookName}</h2>
            <p className="text-sm opacity-70">{book.authorName}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllBooks;