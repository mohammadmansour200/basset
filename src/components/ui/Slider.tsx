import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/utils/cn";

interface SliderProps {
  doubleThumbs?: boolean;
  cutType?: "cut" | "trim";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & SliderProps
>(({ className, cutType, doubleThumbs = false, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={`relative w-full grow overflow-hidden ${doubleThumbs ? "h-6 rounded-sm" : "h-2 rounded-full"} ${cutType === "cut" ? "bg-primary" : "bg-secondary"} `}
    >
      <SliderPrimitive.Range
        className={`absolute h-full ${cutType === "cut" ? "bg-secondary" : "bg-primary"}`}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={`block ${doubleThumbs ? "h-7 w-2 rounded-sm" : "h-5 w-5 rounded-full"} border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`}
    />
    {doubleThumbs && (
      <SliderPrimitive.Thumb className="block h-7 w-2 rounded-sm border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
