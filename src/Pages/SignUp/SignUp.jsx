import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext";
import api from "../../utilitys/api";

const SignUp = () => {
  const { createUser, loginWithGoogle } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);
  const [image, setImage]     = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password", "");

  // ✅ Return to intended page after signup
  const from = location.state?.from?.pathname || "/";

  // ── Password strength ──────────────────────────────────────────────────────
  const checks = {
    length:  password.length >= 8,
    lower:   /[a-z]/.test(password),
    upper:   /[A-Z]/.test(password),
    digit:   /\d/.test(password),
    special: /[^\w\s]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][score];
  const strengthColor = ["", "bg-error", "bg-error", "bg-warning", "bg-info", "bg-success"][score];

  const onSubmit = async (data) => {
    try {
      let photoURL = null;

      if (image) {
        // Upload image to ImgBB backend wrapper
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(image);
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
        });
        
        const uploadRes = await api.post("/api/upload-image", { image: base64 });
        photoURL = uploadRes.data.url;
      }

      // ✅ createUser already handles backend sync
      await createUser(data.email, data.password, data.firstName, data.lastName, photoURL);

      Swal.fire({ icon: "success", title: "Account Created!", timer: 1500, showConfirmButton: false });
      navigate(from, { replace: true });
    } catch (err) {
      // ✅ Only show error if Firebase actually failed (not if backend sync had a minor issue)
      if (err.code) {
        const msg =
          err.code === "auth/email-already-in-use" ? "This email is already registered." :
          err.code === "auth/weak-password"        ? "Password is too weak." :
          err.message;
        Swal.fire({ icon: "error", title: "Sign Up Failed", text: msg });
      }
      // If it's only a backend sync error, account was created — navigate anyway
      else {
        Swal.fire({ icon: "success", title: "Account Created!", timer: 1500, showConfirmButton: false });
        navigate(from, { replace: true });
      }
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      Swal.fire({ icon: "success", title: "Signed in with Google!", timer: 1500, showConfirmButton: false });
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Google Sign-In Failed", text: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">

        <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="p-8 sm:p-10 space-y-5">
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black tracking-tight">Create account</h1>
              <p className="text-base-content/50 text-sm">Join BookCourier today — it's free</p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              className="btn btn-outline w-full rounded-xl gap-3 hover:bg-base-200 border-base-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.5 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-4.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 16.3 5 9.7 9.1 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c4.8 0 9.2-1.8 12.5-4.8l-5.8-4.9C28.9 36.8 26.6 37.5 24 37.5c-5.2 0-9.5-3.5-11.1-8.2l-6.6 5.1C9.6 40.8 16.3 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l5.8 4.9C42.8 34.5 44 30 44 25c0-1.2-.1-2.4-.4-4.5z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-base-300" />
              <span className="text-xs text-base-content/40 font-medium">or sign up with email</span>
              <div className="flex-1 h-px bg-base-300" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Profile Image row */}
              <div className="form-control">
                <label className="label py-0 mb-1"><span className="label-text font-semibold text-sm">Profile Picture <span className="text-base-content/40 font-normal">(optional)</span></span></label>
                <div className="flex items-center gap-4">
                  <img
                    src={previewUrl || `https://ui-avatars.com/api/?name=U&background=random&size=48`}
                    alt="preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-base-300 shrink-0"
                  />
                  <label className="btn btn-outline btn-sm rounded-full gap-2 cursor-pointer">
                    {previewUrl ? "📷 Change Photo" : "📷 Upload Photo"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImage(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-0 mb-1"><span className="label-text font-semibold text-sm">First Name</span></label>
                  <input
                    {...register("firstName", { required: "Required" })}
                    type="text" placeholder="John"
                    className={`input input-bordered w-full rounded-xl ${errors.firstName ? "input-error" : ""}`}
                  />
                  {errors.firstName && <p className="text-error text-xs mt-0.5">{errors.firstName.message}</p>}
                </div>
                <div className="form-control">
                  <label className="label py-0 mb-1"><span className="label-text font-semibold text-sm">Last Name</span></label>
                  <input
                    {...register("lastName", { required: "Required" })}
                    type="text" placeholder="Doe"
                    className={`input input-bordered w-full rounded-xl ${errors.lastName ? "input-error" : ""}`}
                  />
                  {errors.lastName && <p className="text-error text-xs mt-0.5">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label py-0 mb-1"><span className="label-text font-semibold text-sm">Email</span></label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                  })}
                  type="email" placeholder="you@example.com"
                  className={`input input-bordered w-full rounded-xl ${errors.email ? "input-error" : ""}`}
                />
                {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label py-0 mb-1"><span className="label-text font-semibold text-sm">Password</span></label>
                <div className="relative">
                  <input
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                    type={showPw ? "text" : "password"} placeholder="••••••••"
                    className={`input input-bordered w-full rounded-xl pr-12 ${errors.password ? "input-error" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content">
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}

                {/* Strength bar */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-base-content/50">
                      <span>Strength: <span className="font-semibold">{strengthLabel}</span></span>
                      <span className="flex gap-2">
                        {Object.entries({ "8+ chars": checks.length, "A–Z": checks.upper, "0–9": checks.digit, "#!": checks.special }).map(([k, v]) => (
                          <span key={k} className={v ? "text-success" : ""}>{k}</span>
                        ))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="form-control">
                <label className="label py-0 mb-1"><span className="label-text font-semibold text-sm">Confirm Password</span></label>
                <div className="relative">
                  <input
                    {...register("confirmPassword", { validate: v => v === password || "Passwords don't match" })}
                    type={showCp ? "text" : "password"} placeholder="••••••••"
                    className={`input input-bordered w-full rounded-xl pr-12 ${errors.confirmPassword ? "input-error" : ""}`}
                  />
                  <button type="button" onClick={() => setShowCp(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content">
                    {showCp ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full rounded-xl">
                {isSubmitting
                  ? <><span className="loading loading-spinner loading-xs"></span> Creating account…</>
                  : "Create Account"
                }
              </button>
            </form>

            <p className="text-center text-sm text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" state={{ from: location.state?.from }} className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;