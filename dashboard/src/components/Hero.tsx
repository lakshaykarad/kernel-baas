interface HeroProps{
    title : string;
    subtitle: string;
}

export default function Hero({title, subtitle} : HeroProps){
    return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <h1 className="text-5xl font-extrabold text-slate-900 mb-6">
        {title}
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mb-10">
        {subtitle}
      </p>
      <button className="px-8 py-3 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800">
        Get Started
      </button>
    </div>
    );
}
