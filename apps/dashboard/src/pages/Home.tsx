
import Hero from "../components/Hero";
import Navbar from "../components/Navbar"; 
 
export default function Home() {
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