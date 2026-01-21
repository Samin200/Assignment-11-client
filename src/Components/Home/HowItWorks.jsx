import { motion } from "framer-motion";
import { FaSearch, FaTruck, FaBookOpen } from "react-icons/fa";

const steps = [
  {
    step: "01",
    icon: <FaSearch />,
    title: "Discover Books Nearby",
    desc: "Search books available in nearby libraries and view real-time availability instantly.",
  },
  {
    step: "02",
    icon: <FaTruck />,
    title: "Place Order & Pay Securely",
    desc: "Confirm your order, choose delivery details, and pay safely through our secure system.",
  },
  {
    step: "03",
    icon: <FaBookOpen />,
    title: "Delivered to Your Doorstep",
    desc: "We pick up the book from the library and deliver it straight to your home.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-base-200">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            How BookCourier Works
          </h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            Borrow books from your favorite libraries without leaving your home.
            Simple, fast, and reliable.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="relative bg-base-100 p-8 rounded-2xl shadow-xl border border-base-300"
            >
              {/* Step Number */}
              <span className="absolute -top-6 left-6 bg-primary text-primary-content px-4 py-1 rounded-full font-semibold">
                {item.step}
              </span>

              {/* Icon */}
              <div className="text-5xl text-primary mb-6">
                {item.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3">
                {item.title}
              </h3>
              <p className="text-base-content/70 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;