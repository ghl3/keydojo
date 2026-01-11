interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-cream-200 shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
