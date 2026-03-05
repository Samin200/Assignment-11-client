import { useState, useContext, useEffect } from "react";
import api from "../../utilitys/api";
import { AuthContext } from "../../Context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const AddBook = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bookName:    "",
    authorName:  "",
    description: "",
    category:    "",
    price:       "",
    pages:       "",
    rating:      "",
    status:      "published",
  });
  const [imageFile, setImageFile]   = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading]       = useState(false);
  const [uploading, setUploading]   = useState(false);

  // 🔐 Role guard
  useEffect(() => {
    if (!user) {
      Swal.fire({ icon: "warning", title: "Login Required", confirmButtonText: "Go to Login" })
        .then(() => navigate("/login"));
      return;
    }
    if (user.role !== "librarian" && user.role !== "admin") {
      Swal.fire({ icon: "error", title: "Access Denied", text: "Only librarians or admins can add books." })
        .then(() => navigate("/"));
    }
  }, [user, navigate]);

  if (user?.role !== "librarian" && user?.role !== "admin") return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Live preview on file select
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.bookName.trim() || !form.authorName.trim() || !form.price) {
      return Swal.fire("Missing Fields", "Title, author, and price are required.", "warning");
    }
    if (!imageFile) {
      return Swal.fire("Missing Image", "Please upload a book cover image.", "warning");
    }
    if (isNaN(form.price) || Number(form.price) <= 0) {
      return Swal.fire("Invalid Price", "Price must be a positive number.", "error");
    }

    setLoading(true);
    setUploading(true);

    try {
      // Convert to base64 and upload
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });

      setUploading(false);

      const imgRes = await api.post("/api/upload-image", { image: base64Image });
      const bookImage = imgRes.data.url;

      await api.post("/books", {
        bookName:    form.bookName.trim(),
        authorName:  form.authorName.trim(),
        description: form.description.trim(),
        category:    form.category.trim(),
        price:       Number(form.price),
        pages:       form.pages  ? Number(form.pages)  : 0,
        rating:      form.rating ? Number(form.rating) : 0,
        bookImage,
        addedBy: user.email,
        status:  form.status,
        addedAt: new Date(),
      });

      Swal.fire({ icon: "success", title: "Book Added!", timer: 2000, showConfirmButton: false });

      setForm({ bookName: "", authorName: "", description: "", category: "", price: "", pages: "", rating: "", status: "published" });
      setImageFile(null);
      setPreviewUrl("");

      navigate("/librarian-dashboard");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Failed to add book. Try again.", "error");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 sm:px-6">

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 p-8 rounded-2xl shadow-2xl text-center space-y-3">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="font-black text-lg">{uploading ? "Uploading image…" : "Saving book…"}</p>
            <p className="text-sm text-base-content/50">Please don't close this window</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4 gap-1">← Back</button>
          <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-1">Librarian</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Add New Book</h1>
          <p className="text-base-content/50 text-sm mt-1">Fill in the details below to publish a new book.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Cover ── */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow border border-base-300 rounded-2xl sticky top-6">
                <div className="card-body p-5 space-y-4">
                  <h2 className="font-black text-lg">Book Cover</h2>

                  {/* Preview */}
                  <label className="cursor-pointer group block">
                    <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-base-200 border-2 border-dashed border-base-300 hover:border-primary/50 transition-colors">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">📷 Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-base-content/30 gap-3">
                          <span className="text-5xl">📖</span>
                          <span className="text-sm font-medium">Click to upload cover</span>
                          <span className="text-xs">400×600 recommended</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>

                  {/* File button fallback */}
                  <label className="btn btn-outline btn-sm w-full gap-2 cursor-pointer">
                    📷 {previewUrl ? "Change Cover" : "Upload Cover"}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>

                  {/* Visibility */}
                  <div className="form-control">
                    <label className="label py-0 mb-1">
                      <span className="label-text font-semibold text-sm">Visibility</span>
                    </label>
                    <select name="status" value={form.status} onChange={handleChange}
                      className="select select-bordered select-sm w-full">
                      <option value="published">✅ Published</option>
                      <option value="unpublished">🚫 Unpublished (Draft)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Details ── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
                <div className="card-body p-5 sm:p-6 space-y-5">
                  <h2 className="font-black text-lg">Book Details</h2>

                  {/* Title */}
                  <div className="form-control">
                    <label className="label py-0 mb-1">
                      <span className="label-text font-semibold">Title <span className="text-error">*</span></span>
                    </label>
                    <input type="text" name="bookName" value={form.bookName} onChange={handleChange}
                      placeholder="e.g. Atomic Habits" className="input input-bordered w-full" required />
                  </div>

                  {/* Author */}
                  <div className="form-control">
                    <label className="label py-0 mb-1">
                      <span className="label-text font-semibold">Author <span className="text-error">*</span></span>
                    </label>
                    <input type="text" name="authorName" value={form.authorName} onChange={handleChange}
                      placeholder="e.g. James Clear" className="input input-bordered w-full" required />
                  </div>

                  {/* Description */}
                  <div className="form-control">
                    <label className="label py-0 mb-1">
                      <span className="label-text font-semibold">Description</span>
                    </label>
                    <textarea name="description" value={form.description} onChange={handleChange}
                      placeholder="Short synopsis or about this book…"
                      className="textarea textarea-bordered w-full h-28 resize-none" />
                  </div>

                  {/* Category + Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label py-0 mb-1">
                        <span className="label-text font-semibold">Category</span>
                      </label>
                      <input type="text" name="category" value={form.category} onChange={handleChange}
                        placeholder="e.g. Fiction, Self-Help" className="input input-bordered w-full" />
                    </div>
                    <div className="form-control">
                      <label className="label py-0 mb-1">
                        <span className="label-text font-semibold">Price (USD) <span className="text-error">*</span></span>
                      </label>
                      <input type="number" name="price" value={form.price} onChange={handleChange}
                        placeholder="9.99" min="0" step="0.01" className="input input-bordered w-full" required />
                    </div>
                  </div>

                  {/* Pages + Rating */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label py-0 mb-1">
                        <span className="label-text font-semibold">Pages</span>
                      </label>
                      <input type="number" name="pages" value={form.pages} onChange={handleChange}
                        placeholder="e.g. 320" min="0" className="input input-bordered w-full" />
                    </div>
                    <div className="form-control">
                      <label className="label py-0 mb-1">
                        <span className="label-text font-semibold">Rating (0–5)</span>
                      </label>
                      <input type="number" name="rating" value={form.rating} onChange={handleChange}
                        placeholder="e.g. 4.5" min="0" max="5" step="0.1" className="input input-bordered w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Added by (read-only) */}
              <div className="card bg-base-100 shadow border border-base-300 rounded-2xl">
                <div className="card-body p-5">
                  <h2 className="font-black text-sm text-base-content/50 uppercase tracking-wide mb-3">Publisher Info</h2>
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm flex-shrink-0">
                      {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user?.displayName || "User"}</p>
                      <p className="text-xs text-base-content/50">{user?.email}</p>
                    </div>
                    <span className="ml-auto badge badge-sm badge-primary">{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost rounded-full px-6" disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary rounded-full px-8 gap-2" disabled={loading}>
                  {loading
                    ? <><span className="loading loading-spinner loading-xs"></span> Adding…</>
                    : "📚 Add Book"
                  }
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;