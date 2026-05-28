import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "link" | "icon";
type Size = "sm" | "default" | "xs";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700",
  ghost: "text-gray-600 hover:text-gray-800",
  link: "text-indigo-600 hover:text-indigo-700 font-medium",
  icon: "text-gray-400 hover:text-gray-600 text-xl leading-none",
};

const sizeClasses: Record<Size, string> = {
  xs: "text-xs px-3 py-1.5",
  sm: "text-sm px-4 py-2",
  default: "px-4 py-2",
};

export default function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const sizeClass = variant === "icon" || variant === "link" ? "" : sizeClasses[size];

  return (
    <button
      className={`cursor-pointer transition-colors ${variantClasses[variant]} ${sizeClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
