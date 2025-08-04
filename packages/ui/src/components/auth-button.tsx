import * as React from "react"
import { Button, buttonVariants } from "./button"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"
import { type VariantProps } from "class-variance-authority"

interface AuthButtonProps
  extends Omit<React.ComponentProps<"button">, "variant">,
  Omit<VariantProps<typeof buttonVariants>, "variant"> {
  loading?: boolean
  loadingText?: string
  variant?: "default" | "google" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  asChild?: boolean
}

const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({
    className,
    variant = "default",
    size,
    loading = false,
    loadingText,
    children,
    disabled,
    asChild = false,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    // Google OAuth variant styling
    const googleVariant = variant === "google" ? {
      className: cn(
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-300/50",
        "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      )
    } : {}

    return (
      <Button
        ref={ref}
        className={cn(
          variant === "google" && googleVariant.className,
          className
        )}
        variant={variant === "google" ? "outline" : variant}
        size={size}
        disabled={isDisabled}
        asChild={asChild && !loading} // Don't use asChild when loading to show spinner
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            {loadingText || "Loading..."}
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)

AuthButton.displayName = "AuthButton"

export { AuthButton }