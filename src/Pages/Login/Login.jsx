import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext";

const Login = () => {
  const { loginWithEmail } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await loginWithEmail(data.email, data.password);

      Swal.fire({
        icon: "success",
        title: "Logged In!",
        text: "You have successfully logged in.",
        confirmButtonColor: "#6366f1",
      });

      navigate("/dashboard");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-base-200 p-6 rounded-lg shadow-md"
      >
        <h1 className="text-2xl mb-6 font-medium text-center">Login</h1>

        {/* EMAIL */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* PASSWORD */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <p className="text-sm text-accent underline mb-4 cursor-pointer">Forgot password?</p>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm mt-5 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;