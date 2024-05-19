import * as React from "react";

import { cn } from "@/utils/shadcn-utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div>
        <input
          type={type}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50",
            "ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(5,145,255,0.1)]",
            error && "border-red-700 focus-visible:ring-red-700",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className={cn("relative transition-all ", error ? "h-6" : "h-0")}>
          <p className={cn("mt-1 absolute text-sm text-red-700 whitespace-nowrap")}>{error}</p>
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
