import { Link } from "react-router";

export default function CTA() {
  return (
    <section className="py-6 px-6 bg-base-200">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-10 py-16 md:py-20 text-center shadow-2xl">

          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2" />

          <div className="relative z-10">
            <p className="text-primary-content/70 font-semibold tracking-widest uppercase text-sm mb-4">
              Start today
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-primary-content mb-5 leading-tight tracking-tight">
              Your next great read<br className="hidden md:block" /> is one tap away.
            </h2>
            <p className="text-primary-content/70 text-lg mb-10 max-w-xl mx-auto">
              Sign up free and request books from nearby libraries — delivered straight to your door.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn bg-white text-primary hover:bg-white/90 btn-lg rounded-full px-10 font-black shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free →
              </Link>
              <Link
                to="/books"
                className="btn btn-outline border-white/40 text-primary-content hover:bg-white/10 hover:border-white/60 btn-lg rounded-full px-8"
              >
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
