import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl hover:scale-105",
        outline:
          "border-2 border-gray-300 bg-background text-gray-700 hover:border-purple-500 hover:text-purple-600 hover:scale-105 hover:shadow-md",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 hover:scale-105 shadow-sm hover:shadow-md",
        ghost: 
          "text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:scale-105",
        link: 
          "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700",
        gradient:
          "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105",
        success:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105",
        warning:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-105",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-lg hover:shadow-xl hover:scale-105",
        neon:
          "bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white hover:shadow-glow hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-lg",
        xl: "h-14 rounded-2xl px-10 text-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
      glow: {
        none: "",
        subtle: "hover:shadow-glow",
        strong: "shadow-glow hover:shadow-glow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    glow,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Shimmer effect for primary variants */}
        {(variant === "default" || variant === "gradient") && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
        )}
        
        {/* Content */}
        <span className="relative flex items-center justify-center space-x-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
          )}
          
          {children && (
            <span className={cn(
              "transition-transform duration-200",
              loading && "opacity-70"
            )}>
              {children}
            </span>
          )}
          
          {!loading && rightIcon && (
            <span className="flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200">
              {rightIcon}
            </span>
          )}
        </span>
      </Comp>
    );
  }
);

Button.displayName = "Button";

// Button Group Component
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" 
            ? "flex-row -space-x-px" 
            : "flex-col -space-y-px",
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            const isFirst = index === 0;
            const isLast = index === React.Children.count(children) - 1;
            
            return React.cloneElement(child, {
              className: cn(
                child.props.className,
                orientation === "horizontal" 
                  ? cn(
                      "relative focus:z-10",
                      isFirst && "rounded-r-none",
                      isLast && "rounded-l-none",
                      !isFirst && !isLast && "rounded-none"
                    )
                  : cn(
                      "relative focus:z-10",
                      isFirst && "rounded-b-none",
                      isLast && "rounded-t-none",
                      !isFirst && !isLast && "rounded-none"
                    )
              ),
            });
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

// Floating Action Button Component
interface FABProps extends ButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, position = "bottom-right", size = "lg", variant = "default", ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-20 right-6",
      "top-left": "fixed top-20 left-6",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          positionClasses[position],
          "z-50 rounded-full shadow-2xl hover:shadow-3xl",
          className
        )}
        size={size}
        variant={variant}
        {...props}
      />
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

// Icon Button Component
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "icon", variant = "ghost", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        variant={variant}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export { 
  Button, 
  ButtonGroup, 
  FloatingActionButton, 
  IconButton, 
  buttonVariants 
};