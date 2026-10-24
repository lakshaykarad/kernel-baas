export default function NavHost() {
  return (
   <nav className="flex items-center justify-between p-6 border-b border-slate-200">  <div className="text-xl font-bold text-slate-900">Kernel</div>
      <div className="space-x-4">
        {/* We will add real routing to these later */}
        <a href="#" className="text-slate-500 hover:text-slate-900">
          Docs
        </a>
        <a href="#" className="text-slate-500 hover:text-slate-900">
          GitHub
        </a>
      </div>
    </nav>
  );
}
