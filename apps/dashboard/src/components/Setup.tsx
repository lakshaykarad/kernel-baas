import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Setup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/setup", { email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Setup failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="p-6 border border-gray-800 rounded w-96 bg-gray-900">
        <h2 className="text-xl font-bold mb-1">Secret Master Setup</h2>
        <p className="text-sm text-gray-400 mb-6">Create the Platform Owner account</p>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-400">Owner created! Going to login...</p>}

        <form onSubmit={handleSetup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Master Email"
            className="p-2 bg-gray-950 border border-gray-700 rounded text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Master Password"
            className="p-2 bg-gray-950 border border-gray-700 rounded text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
            Create Master Admin
          </button>
        </form>
      </div>
    </div>
  );
}