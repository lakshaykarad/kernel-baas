export default function Navbar() {
  return (
   <nav className="flex items-center justify-between p-6 border-b border-border">  
      <div className="text-xl font-bold text-foreground">Kernel</div>
      <div className="space-x-4">
        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
          Docs
        </a>
        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
          GitHub
        </a>
      </div>
    </nav>
  );
}