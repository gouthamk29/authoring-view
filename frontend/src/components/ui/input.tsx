import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

interface InputWithIconProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
}

function InputWithIcon({
  className,
  type,
  icon,
  value,
  placeholder,
  ...props
}: InputWithIconProps) {
  const hasValue = String(value ?? "").length > 0;

  return (
    <div className="relative w-full">
      {!hasValue && icon && (
        <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center gap-2">
          {icon}

          {placeholder && <span className="text-sm">{placeholder}</span>}
        </div>
      )}

      <input
        type={type}
        value={value}
        data-slot="input"
        className={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { Input, InputWithIcon };
