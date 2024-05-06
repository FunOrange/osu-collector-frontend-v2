import * as React from "react";

import { cn } from "@/utils/shadcn-utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50",
          "ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(5,145,255,0.1)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
