import { api } from "@/lib/api";
import { useEffect, useState } from "react";


// 4. MASTER ADMIN DASHBOARD (See all developers using your SDK)
export default function SuperAdminDashboard() {
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
