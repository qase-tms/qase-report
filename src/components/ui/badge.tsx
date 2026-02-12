import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        // Custom test status variants (Qase TMS colors)
        passed: "border-transparent bg-status-passed-bg text-status-passed",
        failed: "border-transparent bg-status-failed-bg text-status-failed",
        skipped: "border-transparent bg-status-skipped-bg text-status-skipped",
        broken: "border-transparent bg-status-broken-bg text-status-broken",
        blocked: "border-transparent bg-[var(--palette-qase-blue-10)] text-[var(--palette-qase-blue-60)] dark:bg-[var(--palette-qase-blue-80)] dark:text-[var(--palette-qase-blue-40)]",
        invalid: "border-transparent bg-[var(--palette-mustard-10)] text-[var(--palette-mustard-80)] dark:bg-[var(--palette-mustard-100)] dark:text-[var(--palette-mustard-40)]",
        muted: "border-transparent bg-[var(--palette-charcoal-20)] text-[var(--palette-charcoal-70)] dark:bg-[var(--palette-charcoal-90)] dark:text-[var(--palette-charcoal-50)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
