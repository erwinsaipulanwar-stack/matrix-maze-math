import { formatCell, type Cell } from "@/lib/matrix";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "text-base gap-x-2.5 gap-y-0.5 px-3 py-1",
  md: "text-xl gap-x-3.5 gap-y-1 px-3.5 py-1.5",
  lg: "text-2xl gap-x-4 gap-y-1.5 px-4 py-2",
};

export function MatrixView({
  m,
  label,
  size = "md",
  className,
}: {
  m: Cell[][];
  label?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const columns = m[0]?.length ?? 0;
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {label && (
        <span className="font-display text-lg font-bold whitespace-nowrap">
          {label} <span className="text-muted-foreground">=</span>
        </span>
      )}
      <div
        className={cn("matrix-bracket relative inline-grid font-display font-semibold", SIZES[size])}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(1.6em, auto))` }}
        role="img"
        aria-label={`${label ? `${label}: ` : ""}matriks ${m.length} kali ${columns}`}
      >
        {m.flatMap((row, i) =>
          row.map((v, j) => (
            <span key={`${i}-${j}`} className="text-center tabular-nums whitespace-nowrap">
              {formatCell(v)}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
