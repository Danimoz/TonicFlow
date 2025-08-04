import * as React from "react"
import { cn } from "@repo/ui/lib/utils"
import { Input } from "./input"

interface FormFieldProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  helperText?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperTextId = helperText ? `${inputId}-helper` : undefined
    
    return (
      <div className="space-y-1.5 sm:space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 sm:h-11 text-sm sm:text-base transition-all duration-200",
            error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(
            errorId && errorId,
            helperTextId && helperTextId
          ).trim() || undefined}
          {...props}
        />
        {error && (
          <p 
            id={errorId}
            className="text-xs sm:text-sm text-destructive animate-in slide-in-from-top-1 duration-200"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p 
            id={helperTextId}
            className="text-xs sm:text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

export { FormField }