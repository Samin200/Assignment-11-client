import { useEffect, useState } from "react";
import HeroBanner from "../../Components/Home/HeroBanner";
import LatestBooks from "../../Components/Home/LatestBooks";
import CoverageMap from "../../Components/Home/CoverageMap";
import WhyChoose from "../../Components/Home/WhyChoose";
import CTA from "../../Components/Home/CTA";
import api from "../../utilitys/api";
import HowItWorks from "../../Components/Home/HowItWorks";
import TrustedBy from "../../Components/Home/TrustedBy";

const Home = () => {
  const [latestBooks, setLatestBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        // ✅ Fixed: use relative path via api instance, not hardcoded localhost
        const res = await api.get("/books");
        const sorted = res.data.sort((a, b) =>
          b._id.toString().localeCompare(a._id.toString())
        );
        setLatestBooks(sorted.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestBooks();
  }, []);

  return (
    <div className="bg-base-100 text-base-content min-h-screen">
      <HeroBanner />

      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <LatestBooks latestBooks={latestBooks} />
      )}

      <WhyChoose />
      <HowItWorks />
      <CoverageMap />
      <TrustedBy />
      <CTA />
    </div>
  );
};

export default Home;
