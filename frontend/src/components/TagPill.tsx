"use client";

interface TagPillProps {
  name: string;
  color: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TagPill({ name, color, count, active, onClick, onRemove }: TagPillProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[9px] font-medium transition-all
        ${active ? "ring-1" : ""}
      `}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        borderColor: active ? color : "transparent",
      }}
    >
      {name}
      {count !== undefined && (
        <span className="font-mono text-[8px] opacity-70">{count}</span>
      )}
      {onRemove && (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 cursor-pointer opacity-60 hover:opacity-100"
        >
          ×
        </span>
      )}
    </button>
  );
}
