import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  // Base styles - minimal, functional
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
        ghost: 'hover:bg-slate-100 active:bg-slate-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded',
        md: 'h-9 px-4 text-sm rounded-md',
        lg: 'h-10 px-5 text-sm rounded-md',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Keyboard shortcut hint displayed alongside button */
  shortcut?: string;
  /** Loading state */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shortcut, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
        {shortcut && (
          <kbd className="ml-1 hidden rounded bg-slate-800/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 sm:inline-block">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
