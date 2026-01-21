import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";

const SignUp = () => {
  const { createUser } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password", "");

  const onSubmit = async (data) => {
  try {
    // 1️⃣ Create Firebase user with name
    const user = await createUser(data.email, data.password, data.firstName, data.lastName);

    // 2️⃣ Save user to backend
    await axios.post("http://localhost:5020/users", {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    });

    Swal.fire({
      icon: "success",
      title: "Account Created!",
      text: "Your account has been created successfully.",
      confirmButtonColor: "#6366f1",
    });

    console.log("Created:", user);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Sign Up Failed",
      text: error.message,
      confirmButtonColor: "#ef4444",
    });
  }
};

  // Password strength
  const strengthChecks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[^\w\s]/.test(password),
  };
  const strengthScore = Object.values(strengthChecks).filter(Boolean).length;
  const strengthText =
    strengthScore <= 2 ? "Weak" : strengthScore === 3 ? "Fair" : strengthScore === 4 ? "Good" : "Strong";
  const strengthColor =
    strengthScore <= 2 ? "bg-red-500" : strengthScore === 3 ? "bg-yellow-400" : strengthScore === 4 ? "bg-sky-500" : "bg-emerald-500";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-base-200 p-6 rounded-lg shadow-md"
      >
        <h1 className="text-2xl mb-3 font-medium text-center">Create your account</h1>

        {/* FIRST + LAST NAME */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group">
            <input {...register("firstName", { required: "First name is required" })} type="text" placeholder="First Name" className="input input-bordered w-full" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input {...register("lastName", { required: "Last name is required" })} type="text" placeholder="Last Name" className="input input-bordered w-full" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* EMAIL */}
        <div className="relative z-0 w-full mb-5 group">
          <input {...register("email", { required: "Email is required", pattern: /\S+@\S+\.\S+/ })} type="email" placeholder="Email" className="input input-bordered w-full" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* PASSWORD */}
        <div className="relative z-0 w-full mb-2 group">
          <input {...register("password", { required: "Password is required" })} type="password" placeholder="Password" className="input input-bordered w-full" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* PASSWORD STRENGTH */}
        <div className="mb-3">
          <div className="h-2 w-full bg-base-300 rounded overflow-hidden">
            <div className={`h-full ${strengthColor}`} style={{ width: `${(strengthScore / 5) * 100}%`, transition: "width .2s" }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted">Strength: {strengthText}</span>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative z-0 w-full mb-5 group">
          <input {...register("confirmPassword", { validate: val => val === password || "Passwords do not match" })} type="password" placeholder="Confirm Password" className="input input-bordered w-full" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Submit"}
        </button>

        <p className="text-sm mt-5 text-center">
          Already have an account? <Link to="/login" className="text-primary font-medium">Log In</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;