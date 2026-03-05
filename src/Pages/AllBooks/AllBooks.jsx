import api from "../../utilitys/api";
import { useEffect, useState, useMemo, useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../Context/AuthContext";

const BOOKS_PER_PAGE = 12;

const AllBooks = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("newest");
  const [category, setCategory] = useState("all");
  const [page, setPage]         = useState(1);

  const isPrivileged = user?.role === "admin" || user?.role === "librarian";

  useEffect(() => {
    api.get("/books")
      .then(res => {
        let data = res.data;
        // ✅ Hide unpublished books from regular users and guests
        if (!isPrivileged) {
          data = data.filter(b => b.status === "published");
        }
        setBooks(data);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [isPrivileged]);

  useEffect(() => { setPage(1); }, [search, sort, category]);

  const categories = useMemo(() => {
    const cats = books.map(b => b.category).filter(Boolean);
    return ["all", ...new Set(cats)];
  }, [books]);

  const filtered = useMemo(() => {
    let result = [...books];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.bookName?.toLowerCase().includes(q) ||
        b.authorName?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
      );
    }
    if (category !== "all") result = result.filter(b => b.category === category);

    switch (sort) {
      case "newest":     result.sort((a, b) => b._id.localeCompare(a._id)); break;
      case "oldest":     result.sort((a, b) => a._id.localeCompare(b._id)); break;
      case "price-asc":  result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating":     result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "name":       result.sort((a, b) => a.bookName.localeCompare(b.bookName)); break;
    }
    return result;
  }, [books, search, sort, category]);

  const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE);

  const goToPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    return range;
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/50 font-medium">Loading books…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">

        {/* Header */}
        <div>
          <p className="text-primary font-semibold tracking-widest uppercase text-xs sm:text-sm mb-2">Library</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">All Books</h1>
          <p className="text-base-content/50 mt-2 text-sm">
            {filtered.length} book{filtered.length !== 1 ? "s" : ""} found
            {(search || category !== "all") && (
              <button onClick={() => { setSearch(""); setCategory("all"); setSort("newest"); }} className="ml-3 text-primary underline hover:no-underline text-xs font-semibold">
                Clear filters
              </button>
            )}
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40">🔍</span>
            <input type="text" placeholder="Search by title, author or category…"
              className="input input-bordered w-full pl-11 rounded-xl bg-base-100"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content">✕</button>}
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="select select-bordered rounded-xl bg-base-100 w-full sm:w-44">
            {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="select select-bordered rounded-xl bg-base-100 w-full sm:w-44">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">A → Z</option>
          </select>
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="text-6xl">📭</p>
            <p className="text-xl font-bold">No books found</p>
            <p className="text-base-content/50">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(""); setCategory("all"); setSort("newest"); }} className="btn btn-primary btn-sm rounded-full">Clear filters</button>
          </div>
        )}

        {/* Grid */}
        {paginated.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {paginated.map(book => (
              <Link to={`/book/${book._id}`} key={book._id}
                className="group bg-base-100 rounded-2xl overflow-hidden border border-base-300 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative overflow-hidden h-52 sm:h-56">
                  <img src={book.bookImage} alt={book.bookName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = "https://via.placeholder.com/400x600?text=No+Image"; }} />
                  <div className="absolute top-3 right-3 bg-primary text-primary-content text-xs font-black px-2.5 py-1 rounded-full shadow-lg">${book.price}</div>
                  {book.rating > 0 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">⭐ {book.rating}</div>
                  )}
                  {/* Show unpublished badge for privileged users */}
                  {isPrivileged && book.status === "unpublished" && (
                    <div className="absolute bottom-3 left-3 bg-warning/90 text-warning-content text-xs font-bold px-2 py-0.5 rounded-full">🚫 Unpublished</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-semibold">View Details →</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h2 className="font-black text-sm sm:text-base leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">{book.bookName}</h2>
                  <p className="text-xs sm:text-sm text-base-content/50 font-medium mb-2">{book.authorName}</p>
                  {book.category && (
                    <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">{book.category}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-base-content/50 order-2 sm:order-1">
              Showing <span className="font-semibold text-base-content">{(page - 1) * BOOKS_PER_PAGE + 1}–{Math.min(page * BOOKS_PER_PAGE, filtered.length)}</span> of <span className="font-semibold text-base-content">{filtered.length}</span> books
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
              <button onClick={() => goToPage(1)} disabled={page === 1} className="btn btn-sm btn-ghost rounded-xl disabled:opacity-30">«</button>
              <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="btn btn-sm btn-ghost rounded-xl disabled:opacity-30">‹ Prev</button>
              {pageNumbers[0] > 1 && <><button onClick={() => goToPage(1)} className="btn btn-sm btn-ghost rounded-xl">1</button>{pageNumbers[0] > 2 && <span className="px-1 text-base-content/30">…</span>}</>}
              {pageNumbers.map(n => <button key={n} onClick={() => goToPage(n)} className={`btn btn-sm rounded-xl min-w-[36px] ${n === page ? "btn-primary" : "btn-ghost"}`}>{n}</button>)}
              {pageNumbers[pageNumbers.length - 1] < totalPages && <><span className="px-1 text-base-content/30">…</span><button onClick={() => goToPage(totalPages)} className="btn btn-sm btn-ghost rounded-xl">{totalPages}</button></>}
              <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="btn btn-sm btn-ghost rounded-xl disabled:opacity-30">Next ›</button>
              <button onClick={() => goToPage(totalPages)} disabled={page === totalPages} className="btn btn-sm btn-ghost rounded-xl disabled:opacity-30">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBooks;