import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "dark" | "warn" }) {
  const tones = {
    neutral: "bg-paper text-ink border border-line",
    dark: "bg-black/55 text-white backdrop-blur",
    warn: "bg-[#f3e4c3] text-[#5c3f0e] border border-[#d9bf86]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
