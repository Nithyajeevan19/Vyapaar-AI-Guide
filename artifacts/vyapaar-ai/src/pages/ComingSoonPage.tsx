import { Link, useLocation } from "wouter";
import { Lock, ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
  const [location] = useLocation();
  
  // Extract path name nicely
  const featureName = location.substring(1).charAt(0).toUpperCase() + location.substring(2);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground/50">
        <Lock size={40} />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-3">
        {featureName} is Coming Soon
      </h1>
      
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        We're working hard to bring you the best AI-powered {featureName.toLowerCase()} tools for your business. Stay tuned!
      </p>
      
      <Link href="/dashboard">
        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 font-medium transition-colors">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
