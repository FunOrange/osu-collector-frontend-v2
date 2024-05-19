import * as React from "react";

import { cn } from "@/utils/shadcn-utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";

export { Textarea };
