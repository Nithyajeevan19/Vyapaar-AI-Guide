export function SkeletonCard({ className = "h-32" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
  );
}
