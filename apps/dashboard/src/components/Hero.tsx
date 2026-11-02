import { Link } from "react-router-dom";

interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
      <h1 className="text-4xl font-bold text-white mb-4 max-w-2xl">
        {title}
      </h1>
      <p className="text-lg text-gray-400 max-w-xl mb-8">
        {subtitle}
      </p>
      <Link
        to="/register"
        className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
      >
        Start Building (Free API Key)
      </Link>
    </div>
  );
}