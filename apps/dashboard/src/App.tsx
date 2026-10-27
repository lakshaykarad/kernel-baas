import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {}
      <Navbar />
      {}
      <Hero 
        title="Your Personal Backend-as-a-Service." 
        subtitle="A modular, self-hosted platform for developers. Build faster with built-in Auth, Realtime Database, and Storage."
      />
    </div>
  );
}