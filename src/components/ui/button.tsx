import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-display font-semibold tracking-wide cursor-pointer select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[4px] active:shadow-none [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-coral text-primary-foreground shadow-[0_4px_0_0_var(--coral-shade)] hover:brightness-105",
        sunny:
          "bg-sunny text-secondary-foreground shadow-[0_4px_0_0_var(--sunny-shade)] hover:brightness-105",
        teal: "bg-teal text-accent-foreground shadow-[0_4px_0_0_var(--teal-shade)] hover:brightness-105",
        sky: "bg-sky text-primary-foreground shadow-[0_4px_0_0_var(--sky-shade)] hover:brightness-105",
        success:
          "bg-success text-success-foreground shadow-[0_4px_0_0_var(--teal-shade)] hover:brightness-105",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_4px_0_0_var(--coral-shade)] hover:brightness-105",
        outline:
          "border-2 border-border bg-card text-foreground shadow-[0_4px_0_0_var(--border-shade)] hover:bg-muted",
        secondary: "bg-muted text-foreground shadow-[0_4px_0_0_var(--border-shade)] hover:brightness-95",
        ghost: "text-foreground hover:bg-muted active:translate-y-0",
        link: "text-coral underline-offset-4 hover:underline active:translate-y-0",
      },
      size: {
        default: "h-11 px-5 text-base",
        sm: "h-9 rounded-xl px-3 text-sm",
        lg: "h-13 px-7 text-lg",
        xl: "h-15 rounded-3xl px-8 text-xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
