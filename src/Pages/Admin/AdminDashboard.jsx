import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [librarianRequests, setLibrarianRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      Swal.fire("Access Denied", "You are not an admin", "error");
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, booksRes, requestsRes] = await Promise.all([
          axios.get("http://localhost:5020/api/users"),
          axios.get("http://localhost:5020/books"),
          axios.get("http://localhost:5020/api/librarian-requests"),
        ]);

        setUsers(usersRes.data);
        setBooks(booksRes.data);
        setLibrarianRequests(requestsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load dashboard data", "error");
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`http://localhost:5020/api/users/${userId}/role`, {
        role: newRole,
      });

      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      Swal.fire("Success", `User is now ${newRole}`, "success");
    } catch {
      Swal.fire("Error", "Failed to update role", "error");
    }
  };

  const handleLibrarianRequest = async (requestId, action, userId) => {
    try {
      await axios.patch(`http://localhost:5020/api/librarian-requests/${requestId}`, {
        status: action,
      });

      if (action === "approved") {
        setUsers(users.map(u => u.uid === userId ? { ...u, role: "librarian" } : u));
      }

      setLibrarianRequests(librarianRequests.map(r => r._id === requestId ? { ...r, status: action } : r));
      Swal.fire("Success", `Request ${action}`, "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update request", "error");
    }
  };

  const handleDeleteBook = async (bookId) => {
    const result = await Swal.fire({
      title: "Delete Book?",
      text: "This will delete the book and all related orders!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        // Add delete route later
        setBooks(books.filter(b => b._id !== bookId));
        Swal.fire("Deleted", "Book removed", "success");
      } catch  {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-error">Access Denied — Admins Only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary">
          Admin Dashboard
        </h1>

        {/* Users Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.displayName || "No Name"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${
                        u.role === "admin" ? "badge-error" :
                        u.role === "librarian" ? "badge-warning" : "badge-success"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="space-x-2">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleRoleChange(u._id, "admin")}
                          className="btn btn-sm btn-error"
                        >
                          Make Admin
                        </button>
                      )}
                      {u.role !== "librarian" && (
                        <button
                          onClick={() => handleRoleChange(u._id, "librarian")}
                          className="btn btn-sm btn-warning"
                        >
                          Make Librarian
                        </button>
                      )}
                      {u.role !== "user" && (
                        <button
                          onClick={() => handleRoleChange(u._id, "user")}
                          className="btn btn-sm btn-ghost"
                        >
                          Demote to User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Librarian Requests Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Librarian Requests</h2>
          {librarianRequests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Request Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {librarianRequests.map((r) => (
                    <tr key={r._id}>
                      <td>{r.userInfo.displayName || "No Name"}</td>
                      <td>{r.userInfo.email}</td>
                      <td>
                        <span className={`badge ${
                          r.status === "pending" ? "badge-info" :
                          r.status === "approved" ? "badge-success" :
                          "badge-error"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="space-x-2">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleLibrarianRequest(r._id, "approved", r.userId)}
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLibrarianRequest(r._id, "rejected", r.userId)}
                              className="btn btn-sm btn-error"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Books Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Manage All Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book._id} className="card bg-base-100 shadow-xl">
                <figure>
                  <img src={book.bookImage} alt={book.bookName} className="h-48 object-cover" />
                </figure>
                <div className="card-body">
                  <h3 className="card-title text-lg">{book.bookName}</h3>
                  <p className="text-sm opacity-70">by {book.authorName}</p>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-warning">
                      Unpublish
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;