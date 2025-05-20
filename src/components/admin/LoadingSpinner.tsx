import React from "react";
import { Spinner } from "@salesforce/design-system-react";

interface LoadingSpinnerProps {
  size?: "xx-small" | "x-small" | "small" | "medium" | "large";
  variant?: "base" | "brand" | "inverse";
  containerClassName?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  variant = "brand",
  containerClassName = "",
}) => (
  <div
    className={`slds-align_absolute-center slds-p-around_medium ${containerClassName}`}
  >
    <Spinner
      size={size}
      variant={variant}
      assistiveText={{
        label: "Loading",
      }}
    />
  </div>
);

export default LoadingSpinner;
