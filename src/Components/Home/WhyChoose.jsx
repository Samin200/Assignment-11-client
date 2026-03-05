const features = [
  { icon: "🚀", title: "Fast Doorstep Delivery", desc: "Books from trusted libraries arrive at your door within hours." },
  { icon: "📅", title: "Easy Scheduling",        desc: "Flexible pickup and return windows that fit your routine." },
  { icon: "📍", title: "Real-Time Tracking",     desc: "Watch your book move from shelf to doorstep, live." },
  { icon: "🔒", title: "Secure & Trusted",       desc: "Every partner library is verified and books are handled with care." },
];

const stats = [
  { value: "+12k", label: "Books Delivered" },
  { value: "+320", label: "Partner Libraries" },
  { value: "+8k",  label: "Active Readers"  },
  { value: "99%",  label: "On-time Delivery" },
];

export default function WhyChoose() {
  return (
    <section className="py-24 bg-base-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section label ── */}
        <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3 text-center">Why us</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
          Why Choose BookCourier?
        </h2>
        <p className="text-base-content/50 text-center max-w-xl mx-auto mb-16">
          We built the fastest, most reliable book delivery service — so your next great read is always one tap away.
        </p>

        {/* ── Two-column layout ── */}
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Features list */}
          <div className="space-y-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex gap-5 p-5 rounded-2xl bg-base-200 border border-base-300
                           hover:border-primary/30 hover:bg-primary/5
                           transition-all duration-200 group"
              >
                <div className="text-3xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                  <p className="text-base-content/60 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-5">
            {stats.map((s, i) => (
              <div
                key={i}
                className="relative p-8 rounded-2xl bg-base-200 border border-base-300 text-center
                           hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl
                           transition-all duration-300 overflow-hidden group"
              >
                {/* Decorative blob */}
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/10
                                group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="text-4xl font-black text-primary mb-1">{s.value}</div>
                  <div className="text-sm text-base-content/60 font-medium">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
