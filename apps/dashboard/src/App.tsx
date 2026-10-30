import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Setup from "./components/Setup";

function Home() {
  return (
    <>
      <Navbar />
      <Hero
        title="Your Personal Backend-as-a-Service."
        subtitle="A modular, self-hosted platform for developers. Build faster with built-in Auth, Realtime Database, and Storage."
      />
    </>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground mb-8">
          Welcome, Master Admin. Manage your BaaS infrastructure below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow border border-border border-t-4 border-t-blue-600">
            <h2 className="text-xl font-bold mb-2">Projects & API Keys</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Generate API keys to connect your frontends to the Kernel SDK.
            </p>
            <button className="px-4 py-2 text-sm text-primary-foreground bg-primary rounded hover:opacity-90 transition-opacity font-medium">
              Create Project
            </button>
          </div>
 
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow border border-border border-t-4 border-t-green-500">
            <h2 className="text-xl font-bold mb-2">SDK Authentication</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage end-users who have signed up through your apps.
            </p>
            <button className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:opacity-90 transition-opacity font-medium">
              View Users
            </button>
          </div>
 
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow border border-border border-t-4 border-t-purple-500 opacity-75">
            <h2 className="text-xl font-bold mb-2">Database</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Configure your PostgreSQL tables and rules.
            </p>
            <span className="text-xs font-bold text-purple-500 uppercase">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}