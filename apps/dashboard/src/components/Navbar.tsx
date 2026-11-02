import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 border-b border-gray-800">
      <Link to="/" className="text-xl font-bold text-white">
        Kernel SDK
      </Link>
      <div className="flex gap-4">
        <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white">
          Login
        </Link>
        <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Developer Sign Up
        </Link>
      </div>
    </nav>
  );
}