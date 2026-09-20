import clsx from "clsx";

const variants = {
  primary:
    "bg-teal-700 text-white hover:bg-teal-800 shadow-sm",
  secondary:
    "bg-white text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
