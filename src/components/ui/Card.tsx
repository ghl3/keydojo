interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-cream-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
