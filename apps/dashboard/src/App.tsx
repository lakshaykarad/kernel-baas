import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from "react-router-dom";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Setup from "./components/Setup";
import { api } from "./lib/api";

// 1. PUBLIC HOME PAGE FOR DEVELOPERS
function Home() {
  return (
    <>
      <Navbar />
      <Hero
        title="Your Personal Backend-as-a-Service."
        subtitle="Create a project, copy your API key, and plug Kernel SDK into your app."
      />
    </>
  );
}

// 2. DEVELOPER SIGN UP PAGE
function Register() {
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

// 3. DEVELOPER DASHBOARD (Create Project + See My Projects + Upcoming SDK Features)
function DeveloperDashboard() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [newApiKey, setNewApiKey] = useState("");
  const [error, setError] = useState("");

  // Load this developer's existing projects
  const fetchMyProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Could not load projects", err);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/projects", { name: projectName });
      setNewApiKey(res.data.apiKey);
      setProjectName("");
      fetchMyProjects(); // Refresh the project list below
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create project");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-1">Developer Dashboard</h1>
      <p className="text-gray-400 mb-8">Manage your projects, API keys, and SDK services.</p>

      {/* Show API Key when a new project is created */}
      {newApiKey && (
        <div className="p-4 mb-8 border border-green-500 bg-gray-900 rounded">
          <p className="font-bold text-green-400 mb-1">New API Key Generated (Copy it now!):</p>
          <div className="flex gap-2 items-center">
            <code className="p-2 bg-black rounded text-sm flex-1 break-all">{newApiKey}</code>
            <button
              onClick={() => navigator.clipboard.writeText(newApiKey)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Create New Project Box */}
      <div className="p-6 mb-8 border border-gray-800 bg-gray-900 rounded">
        <h2 className="text-lg font-bold mb-4">Create New Project</h2>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={handleCreateProject} className="flex gap-3">
          <input
            type="text"
            placeholder="Project Name (e.g. My Android Chat App)"
            className="p-2 bg-gray-950 border border-gray-700 rounded text-white flex-1"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Create & Get Key
          </button>
        </form>
      </div>

      {/* My Projects List */}
      <div className="p-6 mb-8 border border-gray-800 bg-gray-900 rounded">
        <h2 className="text-lg font-bold mb-4">My Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <p className="text-gray-400 text-sm">You haven't created any projects yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((proj) => (
              <div key={proj.id} className="p-3 border border-gray-800 bg-gray-950 rounded flex justify-between">
                <div>
                  <p className="font-bold">{proj.name}</p>
                  <p className="text-xs text-gray-400">Project ID: {proj.id}</p>
                </div>
                <p className="text-xs text-gray-400">
                  Created: {new Date(proj.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SDK Features (Marked as Upcoming) */}
      <div>
        <h2 className="text-lg font-bold mb-4">SDK Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-800 bg-gray-900 rounded">
            <span className="text-xs bg-gray-800 text-yellow-400 px-2 py-1 rounded">Upcoming</span>
            <h3 className="font-bold mt-2">User Auth SDK</h3>
            <p className="text-sm text-gray-400 mt-1">Login, signup, and OTP password reset for your app users.</p>
          </div>
          <div className="p-4 border border-gray-800 bg-gray-900 rounded">
            <span className="text-xs bg-gray-800 text-yellow-400 px-2 py-1 rounded">Upcoming</span>
            <h3 className="font-bold mt-2">Realtime Database</h3>
            <p className="text-sm text-gray-400 mt-1">Store JSON data and sync live chat messages.</p>
          </div>
          <div className="p-4 border border-gray-800 bg-gray-900 rounded">
            <span className="text-xs bg-gray-800 text-yellow-400 px-2 py-1 rounded">Upcoming</span>
            <h3 className="font-bold mt-2">Cloud Storage</h3>
            <p className="text-sm text-gray-400 mt-1">Upload and serve images, PDFs, and app files.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. MASTER ADMIN DASHBOARD (See all developers using your SDK)
function SuperAdminDashboard() {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/projects/super-admin")
      .then((res) => setDevelopers(res.data.developers))
      .catch((err) => setError(err.response?.data?.error || "Access denied"));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-1">Master Admin Control Panel</h1>
      <p className="text-gray-400 mb-8">Overview of all developers registered on your Kernel SDK platform.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="p-6 border border-gray-800 bg-gray-900 rounded mb-6">
        <p className="text-lg">
          Total Developers Using SDK: <span className="font-bold text-blue-400">{developers.length}</span>
        </p>
      </div>

      <div className="border border-gray-800 bg-gray-900 rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950 text-sm text-gray-400">
              <th className="p-4">Developer Email</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4">Projects Created</th>
            </tr>
          </thead>
          <tbody>
            {developers.map((dev) => (
              <tr key={dev.id} className="border-b border-gray-800 text-sm">
                <td className="p-4">{dev.email}</td>
                <td className="p-4 text-gray-400">{new Date(dev.createdAt).toLocaleString()}</td>
                <td className="p-4 font-bold">{dev._count?.projects || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DeveloperDashboard />} />

        {/* SECRET MASTER ADMIN ROUTES */}
        <Route path="/secret-setup" element={<Setup />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
      </Routes>
    </Router>
  );
}