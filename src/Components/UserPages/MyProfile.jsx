import { useState, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "../../Firebase/firebase.init";
import Swal from "sweetalert2";
import axios from "axios";

const MyProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.displayName || "");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.photoURL || "");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire("Oops", "Name cannot be empty", "warning");
      return;
    }

    setLoading(true);
    let photoURL = user?.photoURL;

    try {
      // Upload image to ImgBB if selected
      if (image) {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = async () => {
          const base64 = reader.result.split(",")[1]; // remove data:image/jpeg;base64,

          try {
            const res = await axios.post("http://localhost:5020/api/upload-image", {
              image: base64,
            });

            photoURL = res.data.url;
            await finalizeUpdate(photoURL);
          } catch {
            Swal.fire("Error", "Failed to upload image", "error");
            setLoading(false);
          }
        };
        return; // wait for reader
      } else {
        await finalizeUpdate(photoURL);
      }
    } catch  {
      Swal.fire("Error", "Update failed", "error");
      setLoading(false);
    }

    async function finalizeUpdate(finalPhotoURL) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
          photoURL: finalPhotoURL,
        });

        setUser((prev) => ({
          ...prev,
          displayName: name.trim(),
          photoURL: finalPhotoURL,
        }));

        setPreviewUrl(finalPhotoURL);

        Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Name and photo saved permanently!",
          timer: 2500,
        });
      } catch{
        Swal.fire("Error", "Failed to save profile", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-3xl font-bold text-center mb-8 text-primary">
              My Profile
            </h2>

            <div className="flex justify-center mb-8">
              <div className="avatar">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                  <img
                    src={previewUrl || "https://via.placeholder.com/150?text=You"}
                    alt="Profile"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-lg">Full Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input input-bordered input-lg w-full"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold text-lg">Profile Photo</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary w-full"
                />
                <p className="text-sm text-base-content/60 mt-2">
                  Upload new photo — saved permanently via ImgBB (free).
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full shadow-lg"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-base-300">
              <p className="text-center text-base-content/70">
                Logged in as: <span className="font-semibold">{user?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;