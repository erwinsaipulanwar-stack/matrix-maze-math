import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  barClassName = "bg-teal",
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-4 w-full overflow-hidden rounded-full border-2 border-border bg-muted", className)}
    >
      <div className={cn("h-full rounded-full transition-all duration-700", barClassName)} style={{ width: `${v}%` }} />
    </div>
  );
}
