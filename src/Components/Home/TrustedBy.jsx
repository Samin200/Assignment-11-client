const partners = [
  { name: "LibraryOne",   emoji: "🏛️" },
  { name: "BookHub",      emoji: "📚" },
  { name: "CityLibrary",  emoji: "🏙️" },
  { name: "ReadMore",     emoji: "📖" },
  { name: "PageTurner",   emoji: "📰" },
  { name: "StoryCraft",   emoji: "✍️" },
];

const TrustedBy = () => (
  <section className="py-20 bg-base-100 overflow-hidden">
    <div className="max-w-6xl mx-auto px-6">

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Our partners</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Trusted by Readers & Libraries
        </h2>
        <p className="text-base-content/50 max-w-lg mx-auto">
          BookCourier partners with top libraries trusted by thousands of readers across the country.
        </p>
      </div>

      {/* Partner cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {partners.map((p, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-base-200 border border-base-300
                       hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg
                       transition-all duration-200 group cursor-default"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{p.emoji}</span>
            <span className="font-bold text-sm text-center text-base-content/70 group-hover:text-primary transition-colors">
              {p.name}
            </span>
          </div>
        ))}
      </div>

      {/* Social proof bar */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
        {[
          { val: "12,000+", label: "Books delivered" },
          { val: "4.9★",    label: "Average rating"  },
          { val: "320+",    label: "Libraries"        },
        ].map((s, i) => (
          <div key={i} className="px-8 py-4 rounded-2xl bg-base-200 border border-base-300 min-w-[140px]">
            <div className="text-2xl font-black text-primary">{s.val}</div>
            <div className="text-xs text-base-content/50 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBy;
