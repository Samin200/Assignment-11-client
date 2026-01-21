import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";

const BecomeLibrarian = () => {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState(null);

  const handleRequest = async () => {
    try {
      const response = await axios.post("/api/users/become-librarian", {
        userId: user.uid,
      });

      if (response.data.success) {
        setStatus("✅ Your request to become a librarian has been submitted!");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Something went wrong. Try again later.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Become a Librarian</h1>
        <p className="text-lg text-gray-700">
          Join BookCourier as a librarian and help readers access books from the comfort of their homes!
        </p>
      </div>

      {/* Why Become a Librarian */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Why Become a Librarian?</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Share your love of books with your community.</li>
            <li>Manage your own library inventory online.</li>
            <li>Earn money from book deliveries and orders.</li>
            <li>Connect with students, researchers, and avid readers.</li>
            <li>Be part of a growing digital library network.</li>
          </ul>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
            alt="Librarian"
            className="rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* Steps to Become a Librarian */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">How it Works</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li>Click the "Submit Request" button below.</li>
          <li>Our team will review your request and approve it.</li>
          <li>Once approved, you can start adding books and managing orders.</li>
          <li>Enjoy full access to your librarian dashboard!</li>
        </ol>
      </div>

      {/* Call-to-Action */}
      <div className="text-center">
        <button
          onClick={handleRequest}
          className="px-8 py-3 btn-primary btn text-lg font-semibold animate-bounce"
        >
          Submit Request
        </button>
        {status && <p className="mt-4 text-green-600 font-medium">{status}</p>}
      </div>

      {/* Extra Section: Community & Benefits */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-inner space-y-4">
        <h2 className="text-2xl font-semibold text-center">Benefits of Joining Our Network</h2>
        <p className="text-center text-gray-700">
          As a librarian on BookCourier, you’ll gain exposure to a wide range of readers, get insights into reading trends, 
          and have a chance to grow your personal library business. Your work will help readers get books faster and more conveniently!
        </p>
      </div>
    </div>
  );
};

export default BecomeLibrarian;