// src/Components/Home/WhyChoose.jsx
export default function WhyChoose() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        
        <div>
          <h3 className="text-3xl font-bold mb-4">Why Choose BookCourier?</h3>
          <ul className="space-y-4 text-base-content/80">
            <li>• Fast doorstep delivery from trusted libraries</li>
            <li>• Easy scheduling for pickups and returns</li>
            <li>• Real-time tracking and notifications</li>
            <li>• Secure handling and library partnerships</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-base-100 border border-base-300 shadow-sm text-center animate-fade-in-up">
            <div className="text-3xl font-extrabold text-primary">+12k</div>
            <div className="text-sm text-base-content/70">Books Delivered</div>
          </div>

          <div
            className="p-6 rounded-xl bg-base-100 border border-base-300 shadow-sm text-center animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <div className="text-3xl font-extrabold text-primary">+320</div>
            <div className="text-sm text-base-content/70">Partner Libraries</div>
          </div>

          <div
            className="p-6 rounded-xl bg-base-100 border border-base-300 shadow-sm text-center animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="text-3xl font-extrabold text-primary">+8k</div>
            <div className="text-sm text-base-content/70">Active Users</div>
          </div>

          <div
            className="p-6 rounded-xl bg-base-100 border border-base-300 shadow-sm text-center animate-fade-in-up"
            style={{ animationDelay: "450ms" }}
          >
            <div className="text-3xl font-extrabold text-primary">99%</div>
            <div className="text-sm text-base-content/70">On-time Delivery</div>
          </div>
        </div>
      </div>
    </section>
  );
}