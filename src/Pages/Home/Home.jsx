// src/Components/Home/Home.jsx
import { useEffect, useState } from "react";
import HeroBanner from "../../Components/Home/HeroBanner";
import LatestBooks from "../../Components/Home/LatestBooks";
import CoverageMap from "../../Components/Home/CoverageMap";
import WhyChoose from "../../Components/Home/WhyChoose";
import CTA from "../../Components/Home/CTA";
import axios from "axios";
import HowItWorks from "../../Components/Home/HowItWorks";
import TrustedBy from "../../Components/Home/TrustedBy";

const Home = () => {
  const [latestBooks, setLatestBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        const res = await axios.get("http://localhost:5020/books");
        const books = res.data;

        // Sort by MongoDB _id (newest first — _id contains timestamp)
        const sortedBooks = books.sort((a, b) => 
          b._id.toString().localeCompare(a._id.toString())
        );

        // Take latest 6
        setLatestBooks(sortedBooks.slice(0, 6));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch books:", err);
        setLoading(false);
      }
    };

    fetchLatestBooks();
  }, []);

  return (
    <div className="bg-base-300 text-base-content min-h-screen">
      <HeroBanner />

      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <LatestBooks latestBooks={latestBooks} />
      )}

      <CoverageMap />
      <WhyChoose />
      <HowItWorks/>
      <TrustedBy/>
      <CTA />
    </div>
  );
};

export default Home;