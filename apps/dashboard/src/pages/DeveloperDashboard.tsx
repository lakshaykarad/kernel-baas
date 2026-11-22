
import React, { useState, useEffect } from "react"; 
import { api } from "../lib/api";

export default function DeveloperDashboard() {
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
