import { RefObject } from "react";

import formatTimestamp from "@/utils/timestampFormatter";

interface CurrTimeIndicatorProps {
  AVCurrDurationPer: number;
  AVElRef: RefObject<HTMLVideoElement> | RefObject<HTMLAudioElement>;
  sliderElRef: RefObject<HTMLInputElement>;
}

export default function CurrTimeIndicator({
  AVCurrDurationPer,
  AVElRef,
  sliderElRef,
}: CurrTimeIndicatorProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute top-[50px] z-50 h-8 w-[4px] border border-border bg-foreground"
        style={{ left: `${sliderElRef.current?.value || 0}%` }}
      />
      <div
        className="pointer-events-none absolute top-[40px] z-50 h-0 w-0 -translate-x-[6px] border-x-8 border-t-[14px] border-x-transparent border-t-foreground"
        style={{ left: `${sliderElRef.current?.value || 0}%` }}
      />
      <p
        className="absolute top-[82px] rounded-md border border-border px-2"
        style={{ left: `${AVCurrDurationPer || 0}%` }}
      >
        {formatTimestamp(AVElRef.current?.currentTime || 0)}
      </p>
    </>
  );
}
