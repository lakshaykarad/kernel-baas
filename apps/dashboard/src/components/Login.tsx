import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAccessToken } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      setAccessToken(response.data.accessToken);

      // Route based on whether this is the Master Admin or a normal Developer
      if (response.data.isSuperAdmin) {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="p-6 border border-gray-800 rounded w-96 bg-gray-900">
        <h2 className="text-xl font-bold mb-6">Sign In to Kernel</h2>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="username"
            className="p-2 bg-gray-950 border border-gray-700 rounded text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="p-2 bg-gray-950 border border-gray-700 rounded text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-400 text-center">
          New developer? <Link to="/register" className="text-blue-400 underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}