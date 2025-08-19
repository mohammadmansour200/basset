import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getIsAudio } from "@/utils/fsUtils";
import { getPercentage } from "@/utils/getPercentage";
import formatTimestamp from "@/utils/timestampFormatter";
import { cn } from "@/utils/cn";

import AVControls from "./AVControls";
import CutSlider from "./CutSlider";
import CurrTimeIndicator from "./CurrTimeIndicator";
import { useFileStore } from "@/stores/useFileStore";

export interface AVPlayerProps {
  cutType: "trim" | "cut";
  cutTimestamps: [number, number];
  setCutTimestamps: React.Dispatch<React.SetStateAction<[number, number]>>;
}

export default function AVPlayer({
  cutType,
  cutTimestamps,
  setCutTimestamps,
}: AVPlayerProps) {
  const [AVPaused, setAVPaused] = useState(true);
  const [AVCurrDurationPer, setAVCurrDurationPer] = useState(0);

  const { t } = useTranslation();
  const { duration: initialAVDuration, filePath } = useFileStore();
  const isAudio = getIsAudio(filePath);

  const AVElRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const sliderElRef = useRef<HTMLInputElement>(null);
  const startTimestampElRef = useRef<HTMLInputElement>(null);
  const endTimestampElRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function setInputsValue() {
      if (
        startTimestampElRef &&
        startTimestampElRef.current &&
        endTimestampElRef &&
        endTimestampElRef.current
      ) {
        startTimestampElRef.current.value = formatTimestamp(cutTimestamps[0]);
        endTimestampElRef.current.value = formatTimestamp(cutTimestamps[1]);
      }
    }
    setInputsValue();
  }, [cutTimestamps]);

  function handleAVDurationAndIndicator() {
    if (!AVElRef.current) return;
    if (!sliderElRef.current) return;

    const currentTime = AVElRef.current.currentTime;

    if (cutType === "cut") {
      // For trimming, prevent entering the cut region
      if (currentTime > cutTimestamps[0] && currentTime < cutTimestamps[1]) {
        // If coming from left, snap to left boundary
        if (AVElRef.current.currentTime <= cutTimestamps[0]) {
          AVElRef.current.currentTime = cutTimestamps[0];
          const startPercentage =
            (cutTimestamps[0] / AVElRef.current.duration) * 100;
          setAVCurrDurationPer(startPercentage);

          sliderElRef.current.value = `${startPercentage}`;
        } else {
          // If coming from right, snap to right boundary
          AVElRef.current.currentTime = cutTimestamps[1];
          const endPercentage =
            (cutTimestamps[1] / AVElRef.current.duration) * 100;
          setAVCurrDurationPer(endPercentage);

          sliderElRef.current.value = `${endPercentage}`;
        }
        return;
      }
    } else {
      // For cutting, keep within the boundaries
      if (currentTime < cutTimestamps[0]) {
        AVElRef.current.currentTime = cutTimestamps[0];
        const startPercentage =
          (cutTimestamps[0] / AVElRef.current.duration) * 100;
        setAVCurrDurationPer(startPercentage);

        sliderElRef.current.value = `${startPercentage}`;

        return;
      }

      if (currentTime > cutTimestamps[1]) {
        AVElRef.current.currentTime = cutTimestamps[0];
        const endPercentage =
          (cutTimestamps[1] / AVElRef.current.duration) * 100;
        setAVCurrDurationPer(endPercentage);

        sliderElRef.current.value = `${endPercentage}`;

        return;
      }
    }

    // If within allowed region, proceed normally
    const durationPer =
      getPercentage(currentTime, AVElRef.current.duration) || 0;
    setAVCurrDurationPer(durationPer);

    sliderElRef.current.value = `${durationPer}`;
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-col sm:w-auto",
          isAudio
            ? "h-full w-full items-center justify-center gap-3"
            : "w-[98%]",
        )}
      >
        {isAudio ? (
          <audio
            preload="none"
            src={convertFileSrc(filePath)}
            ref={AVElRef as React.RefObject<HTMLAudioElement>}
            onTimeUpdate={() => {
              handleAVDurationAndIndicator();
            }}
            loop
            onPlay={() => {
              setAVPaused(false);
            }}
            onPause={() => setAVPaused(true)}
          />
        ) : (
          <div className="group relative mb-1 inline-flex h-full w-[600px] flex-col items-center justify-center overflow-hidden overflow-y-hidden rounded-md sm:w-auto">
            <video
              preload="none"
              loop
              src={convertFileSrc(filePath)}
              playsInline
              onTimeUpdate={() => {
                handleAVDurationAndIndicator();
              }}
              className="aspect-video h-full w-full rounded-md border-2 border-border bg-black sm:w-[600px]"
              ref={AVElRef as React.RefObject<HTMLVideoElement>}
              controls={false}
              onPlay={() => {
                setAVPaused(false);
              }}
              onPause={() => setAVPaused(true)}
            />
          </div>
        )}
      </div>

      <div className="relative mb-6 w-[600px]">
        <AVControls
          setAVCurrDurationPer={setAVCurrDurationPer}
          sliderElRef={sliderElRef}
          AVElRef={AVElRef as React.RefObject<HTMLVideoElement>}
          AVPaused={AVPaused}
          cutType={cutType}
          cutTimestamps={cutTimestamps}
          setCutTimestamps={setCutTimestamps}
          startTimestampElRef={startTimestampElRef}
          endTimestampElRef={endTimestampElRef}
        />
        <CutSlider
          AVEl={AVElRef.current}
          cutType={cutType}
          setCutTimestamps={setCutTimestamps}
          cutTimestamps={cutTimestamps}
          initialAVDuration={initialAVDuration}
        />
        <CurrTimeIndicator
          sliderElRef={sliderElRef}
          AVElRef={AVElRef}
          AVCurrDurationPer={AVCurrDurationPer}
        />
      </div>
      <p className="rounded-md border border-border p-1">
        {t("operations.cutOutputDuration")}:{" "}
        {formatTimestamp(
          cutType === "cut"
            ? Math.max(
                0,
                initialAVDuration - (cutTimestamps[1] - cutTimestamps[0]),
              )
            : Math.max(0, cutTimestamps[1] - cutTimestamps[0]),
        )}
      </p>
    </>
  );
}
