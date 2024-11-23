import { getPercentage } from "@/utils/getPercentage";
import { Slider } from "../Slider";
import { AVPlayerProps } from "./AVPlayer";

interface CutSliderProps {
  initialAVDuration: number;
  AVEl: HTMLMediaElement | null;
}
type CutSliderTypes = CutSliderProps &
  Pick<AVPlayerProps, "cutType" | "setCutTimestamps" | "cutTimestamps">;

export default function CutSlider({
  cutType,
  setCutTimestamps,
  cutTimestamps,
  initialAVDuration,
  AVEl,
}: CutSliderTypes) {
  return (
    <Slider
      cutType={cutType}
      minStepsBetweenThumbs={5}
      onValueChange={(value) => {
        setCutTimestamps([
          (value[0] / 100) * initialAVDuration,
          (value[1] / 100) * initialAVDuration,
        ]);

        if (!AVEl) return;
        if (cutType === "trim") {
          AVEl.currentTime = (value[0] / 100) * initialAVDuration;
        } else {
          if (value[0] === 0) {
            // If the start timestamp is 0, and current time is before the end timestamp,
            // skip to the end timestamp
            AVEl.currentTime = (value[1] / 100) * initialAVDuration;
          } else {
            AVEl.currentTime = 0;
          }
        }
      }}
      doubleThumbs
      min={0}
      max={100}
      step={0.1}
      value={[
        getPercentage(cutTimestamps[0] || 0, initialAVDuration),
        getPercentage(cutTimestamps[1] || 4, initialAVDuration),
      ]}
      defaultValue={[
        getPercentage(cutTimestamps[0] || 0, initialAVDuration),
        getPercentage(cutTimestamps[1] || 4, initialAVDuration),
      ]}
    />
  );
}
