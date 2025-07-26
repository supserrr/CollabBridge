import React from "react";
import CollabBridgeLogo from "./collabbridge-logo";

interface CollabBridgeBrandProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "wordmark" | "monogram" | "auto";
  orientation?: "horizontal" | "vertical";
  textSize?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const CollabBridgeBrand: React.FC<CollabBridgeBrandProps> = ({
  size = "md",
  variant = "auto",
  orientation = "horizontal", 
  textSize,
  showText = true,
  className = ""
}) => {
  // For monogram variant, always hide text
  if (variant === "monogram") {
    return <CollabBridgeLogo variant="monogram" size={size} className={className} />;
  }
  
  // For wordmark variant, always show text
  if (variant === "wordmark") {
    return <CollabBridgeLogo variant="wordmark" size={size} className={className} />;
  }
  
  // For auto variant, use responsive behavior
  return <CollabBridgeLogo variant="auto" size={size} className={className} />;
};

export default CollabBridgeBrand;