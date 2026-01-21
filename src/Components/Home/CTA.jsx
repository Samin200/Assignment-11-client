// src/Components/Home/CTA.jsx
import { Link } from "react-router";

export default function CTA() {
  return (
    <section className="py-16 text-center bg-primary/70 text-white">
      <div className="max-w-3xl mx-auto px-4">
        <h3 className="text-3xl font-bold mb-3">Ready to request your first book?</h3>
        <p className="mb-6 text-base-content/80">
          Sign up and request books from nearby libraries — delivered to your door.
        </p>
        <Link to="/signup" className="btn btn-primary btn-lg">
          Get Started
        </Link>
      </div>
    </section>
  );
}