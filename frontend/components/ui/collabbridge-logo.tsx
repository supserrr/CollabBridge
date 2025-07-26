import React from "react";
import Image from "next/image";

interface CollabBridgeLogoProps {
  variant?: "wordmark" | "monogram" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export const CollabBridgeLogo: React.FC<CollabBridgeLogoProps> = ({ 
  variant = "auto",
  size = "md",
  theme = "auto",
  className = ""
}) => {
  const sizeClasses = {
    sm: { logo: "w-6 h-6", text: "text-lg" },
    md: { logo: "w-8 h-8", text: "text-xl" }, 
    lg: { logo: "w-12 h-12", text: "text-2xl" },
    xl: { logo: "w-16 h-16", text: "text-3xl" }
  };

  // Monogram only (for tight spaces)
  if (variant === "monogram") {
    return (
      <div className={className}>
        {/* Light theme logo */}
        <Image
          src="/logos/logo-black.svg"
          alt="CollabBridge"
          width={64}
          height={64}
          className={`${sizeClasses[size].logo} dark:hidden`}
        />
        {/* Dark theme logo */}
        <Image
          src="/logos/logo-white.svg"
          alt="CollabBridge"
          width={64}
          height={64}
          className={`${sizeClasses[size].logo} hidden dark:block`}
        />
      </div>
    );
  }

  // Wordmark (logo + text)
  if (variant === "wordmark") {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex-shrink-0">
          {/* Light theme logo */}
          <Image
            src="/logos/logo-black.svg"
            alt="CollabBridge"
            width={64}
            height={64}
            className={`${sizeClasses[size].logo} dark:hidden`}
          />
          {/* Dark theme logo */}
          <Image
            src="/logos/logo-white.svg"
            alt="CollabBridge"
            width={64}
            height={64}
            className={`${sizeClasses[size].logo} hidden dark:block`}
          />
        </div>
        <span className={`font-bold text-primary ${sizeClasses[size].text}`}>
          CollabBridge
        </span>
      </div>
    );
  }

  // Auto - responsive based on container width
  return (
    <div className={`${className}`}>
      {/* Show wordmark on larger screens */}
      <div className="hidden sm:flex items-center space-x-3">
        <div className="flex-shrink-0">
          {/* Light theme logo */}
          <Image
            src="/logos/logo-black.svg"
            alt="CollabBridge"
            width={64}
            height={64}
            className={`${sizeClasses[size].logo} dark:hidden`}
          />
          {/* Dark theme logo */}
          <Image
            src="/logos/logo-white.svg"
            alt="CollabBridge"
            width={64}
            height={64}
            className={`${sizeClasses[size].logo} hidden dark:block`}
          />
        </div>
        <span className={`font-bold text-primary ${sizeClasses[size].text}`}>
          CollabBridge
        </span>
      </div>
      
      {/* Show monogram on smaller screens */}
      <div className="sm:hidden">
        {/* Light theme logo */}
        <Image
          src="/logos/logo-black.svg"
          alt="CollabBridge"
          width={64}
          height={64}
          className={`${sizeClasses[size].logo} dark:hidden`}
        />
        {/* Dark theme logo */}
        <Image
          src="/logos/logo-white.svg"
          alt="CollabBridge"
          width={64}
          height={64}
          className={`${sizeClasses[size].logo} hidden dark:block`}
        />
      </div>
    </div>
  );
};

export default CollabBridgeLogo;
