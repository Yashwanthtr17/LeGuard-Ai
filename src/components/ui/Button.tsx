import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "premium";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97] select-none";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg hover:shadow-primary/20",
    premium: "bg-gradient-to-br from-primary to-primary-light text-white shadow-md hover:shadow-lg hover:shadow-primary/25",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-md hover:shadow-lg hover:shadow-slate-900/20",
    accent: "bg-accent text-slate-900 hover:bg-accent-hover shadow-md hover:shadow-lg hover:shadow-accent/20",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[40px]",
    md: "px-5 py-2.5 text-base min-h-[44px]",
    lg: "px-6 py-3 text-lg min-h-[48px]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
