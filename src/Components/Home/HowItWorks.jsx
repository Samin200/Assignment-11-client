import { motion } from "framer-motion";
import { FaSearch, FaTruck, FaBookOpen } from "react-icons/fa";

const steps = [
  {
    step: "01",
    icon: <FaSearch />,
    title: "Discover Books Nearby",
    desc: "Search books available in nearby libraries and view real-time availability instantly.",
    color: "from-yellow-400/20 to-primary/10",
  },
  {
    step: "02",
    icon: <FaTruck />,
    title: "Place Order & Pay Securely",
    desc: "Confirm your order, choose delivery details, and pay safely through our secure system.",
    color: "from-primary/20 to-blue-400/10",
  },
  {
    step: "03",
    icon: <FaBookOpen />,
    title: "Delivered to Your Door",
    desc: "We pick up the book from the library and deliver it straight to your home.",
    color: "from-green-400/20 to-primary/10",
  },
];

const HowItWorks = () => (
  <section className="py-24 bg-base-200 overflow-hidden">
    <div className="max-w-6xl mx-auto px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Simple process</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How It Works</h2>
        <p className="text-base-content/50 max-w-xl mx-auto">
          From browse to doorstep in three simple steps.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line (desktop) */}
        <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-primary/20" />

        {steps.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="relative"
          >
            <div className={`bg-gradient-to-br ${item.color} bg-base-100 rounded-2xl p-8 border border-base-300
                            hover:border-primary/40 hover:shadow-2xl transition-all duration-300 h-full`}>

              {/* Step number bubble */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20
                                flex items-center justify-center text-2xl text-primary">
                  {item.icon}
                </div>
                <span className="text-6xl font-black text-primary/10 leading-none">{item.step}</span>
              </div>

              <h3 className="text-xl font-black mb-3 leading-tight">{item.title}</h3>
              <p className="text-base-content/60 leading-relaxed text-sm">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
