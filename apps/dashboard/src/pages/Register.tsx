import React, { useState } from "react"; 
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

// 2. DEVELOPER SIGN UP PAGE
export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { email, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="p-6 border border-gray-800 rounded w-96 bg-gray-900">
        <h2 className="text-xl font-bold mb-2">Developer Sign Up</h2>
        <p className="text-sm text-gray-400 mb-6">Create an account to get your SDK API keys</p>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Developer Email"
            className="p-2 bg-gray-950 border border-gray-700 rounded text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 bg-gray-950 border border-gray-700 rounded text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Already have an account? <Link to="/login" className="text-blue-400 underline">Login</Link>
        </p>
      </div>
    </div>
  );
}