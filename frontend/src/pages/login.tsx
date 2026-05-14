import { Form, Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log(formData);

    try {
      console.log("connecting to backend");
      setLoading(true);
      const response = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const token = response.data.token;

      login(token);
      console.log("Success,loggedin token:", token);

      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex h-dvh items-center justify-center px-4"
      style={{
        background: "linear-gradient(to bottom right, #1e1f3b, #2d3250)",
      }}
    >
      <Form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-white/20 bg-white/10 px-8 py-10 shadow-2xl backdrop-blur-md"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-300">Login to continue</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="rounded-lg border border-gray-500 bg-white/10 px-4 py-3 text-white transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="rounded-lg border border-gray-500 bg-white/10 px-4 py-3 text-white transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-orange-400 py-3 font-semibold text-black shadow-md transition duration-200 hover:bg-orange-500"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-300">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-orange-300 hover:text-orange-400"
          >
            Register here
          </Link>
        </p>
      </Form>
    </div>
  );
}
