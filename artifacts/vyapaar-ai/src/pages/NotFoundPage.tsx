import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle size={64} className="text-destructive mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Go Home
        </button>
      </Link>
    </div>
  );
}
