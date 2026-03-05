import { useEffect, useState, useContext } from "react";
import api from "../../utilitys/api";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router";

const MyBooks = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    if (!user) {
      Swal.fire("Login Required", "Please login first", "warning").then(() =>
        navigate("/login"),
      );
      return;
    }

    if (user.role !== "librarian" && user.role !== "admin") {
      Swal.fire(
        "Access Denied",
        "Only librarians can access this page",
        "error",
      ).then(() => navigate("/"));
      return;
    }

    fetchBooks();
  }, [user]);

  const fetchBooks = async () => {
    try {
      const res = await api.get(
        `http://programing-hero-assignment-11-serve.vercel.app/books?addedBy=${user.email}`,
      );
      setBooks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load books", "error");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Book?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(
        `http://programing-hero-assignment-11-serve.vercel.app/books/${id}?email=${user.email}`,
      );

      setBooks(books.filter((book) => book._id !== id));

      Swal.fire("Deleted!", "Book removed successfully", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Delete failed", "error");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(
        `http://programing-hero-assignment-11-serve.vercel.app/books/${editingBook._id}?email=${user.email}`,
        {
          bookName: editingBook.bookName,
          authorName: editingBook.authorName,
          price: editingBook.price,
        },
      );

      setBooks(
        books.map((book) =>
          book._id === editingBook._id ? editingBook : book,
        ),
      );

      setEditingBook(null);
      Swal.fire("Updated!", "Book updated successfully", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Update failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center text-primary">
          My Books
        </h1>

        {books.length === 0 ? (
          <p className="text-center text-lg font-semibold">
            📚 You haven't added any books yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book._id} className="card bg-base-100 shadow-xl">
                <figure>
                  <img
                    src={book.bookImage}
                    alt={book.bookName}
                    className="h-60 w-full object-cover"
                  />
                </figure>

                <div className="card-body">
                  {editingBook?._id === book._id ? (
                    <>
                      <input
                        value={editingBook.bookName}
                        onChange={(e) =>
                          setEditingBook({
                            ...editingBook,
                            bookName: e.target.value,
                          })
                        }
                        className="input input-bordered mb-2"
                      />

                      <input
                        value={editingBook.authorName}
                        onChange={(e) =>
                          setEditingBook({
                            ...editingBook,
                            authorName: e.target.value,
                          })
                        }
                        className="input input-bordered mb-2"
                      />

                      <input
                        type="number"
                        value={editingBook.price}
                        onChange={(e) =>
                          setEditingBook({
                            ...editingBook,
                            price: e.target.value,
                          })
                        }
                        className="input input-bordered mb-4"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="btn btn-success btn-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingBook(null)}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="card-title">{book.bookName}</h2>
                      <p>by {book.authorName}</p>
                      <p className="font-semibold">${book.price}</p>

                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setEditingBook(book)}
                          className="btn btn-warning btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          className="btn btn-error btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
