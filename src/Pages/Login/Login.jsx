import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext";

const Login = () => {
  const { loginWithEmail, loginWithGoogle } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // ✅ Return to the page the user was trying to access
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (data) => {
    try {
      await loginWithEmail(data.email, data.password);
      Swal.fire({ icon: "success", title: "Welcome back!", timer: 1500, showConfirmButton: false });
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Login Failed", text: err.message });
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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="p-8 sm:p-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
              <p className="text-base-content/50 text-sm">Sign in to your BookCourier account</p>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              className="btn btn-outline w-full rounded-xl gap-3 hover:bg-base-200 border-base-300"
            >
              {/* Google SVG */}
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.5 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-4.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 16.3 5 9.7 9.1 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c4.8 0 9.2-1.8 12.5-4.8l-5.8-4.9C28.9 36.8 26.6 37.5 24 37.5c-5.2 0-9.5-3.5-11.1-8.2l-6.6 5.1C9.6 40.8 16.3 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l5.8 4.9C42.8 34.5 44 30 44 25c0-1.2-.1-2.4-.4-4.5z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-base-300" />
              <span className="text-xs text-base-content/40 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-base-300" />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="form-control">
                <label className="label py-0 mb-1">
                  <span className="label-text font-semibold text-sm">Email</span>
                </label>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  placeholder="you@example.com"
                  className={`input input-bordered w-full rounded-xl ${errors.email ? "input-error" : ""}`}
                />
                {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label py-0 mb-1">
                  <span className="label-text font-semibold text-sm">Password</span>
                  <button type="button" className="label-text-alt text-primary text-xs hover:underline">
                    Forgot password?
                  </button>
                </label>
                <div className="relative">
                  <input
                    {...register("password", { required: "Password is required" })}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input input-bordered w-full rounded-xl pr-12 ${errors.password ? "input-error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full rounded-xl"
              >
                {isSubmitting
                  ? <><span className="loading loading-spinner loading-xs"></span> Signing in…</>
                  : "Sign In"
                }
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-base-content/60">
              Don't have an account?{" "}
              <Link
                to="/signup"
                state={{ from: location.state?.from }}
                className="text-primary font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;