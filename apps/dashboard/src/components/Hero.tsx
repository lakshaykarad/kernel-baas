import { Link } from "react-router-dom";

interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <h1 className="text-5xl font-extrabold text-foreground mb-6 max-w-3xl">
        {title}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-10">
        {subtitle}
      </p>

       <div className="flex justify-center pb-20">
        <Link
          to="/setup"
          className="px-6 py-2 text-white bg-gray-700 rounded font-medium hover:bg-gray-700 "
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}