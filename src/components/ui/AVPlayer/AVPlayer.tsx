import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getIsAudio } from "@/utils/fsUtils";
import { getPercentage } from "@/utils/getPercentage";
import formatTimestamp from "@/utils/timestampFormatter";
import { cn } from "@/utils/cn";

import { useFile } from "@/contexts/FileProvider";
import AVControls from "./AVControls";
import CutSlider from "./CutSlider";
import CurrTimeIndicator from "./CurrTimeIndicator";
import CutTimestampsInput from "./CutTimestampsInput";

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
  const [AVDuration, setAVDuration] = useState(
    cutTimestamps[1] - cutTimestamps[0],
  );
  const [AVCurrDurationPer, setAVCurrDurationPer] = useState(0);

  const { t } = useTranslation();
  const { duration: initialAVDuration, filePath } = useFile();
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
    const durationPer =
      getPercentage(
        AVElRef.current?.currentTime as number,
        AVElRef.current?.duration as number,
      ) || 0;

    setAVCurrDurationPer(durationPer);
    if (sliderElRef.current) {
      sliderElRef.current.value = `${durationPer}`;
    }
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
      <p className="rounded-md border border-border p-1">
        {t("tabs.cutOutputDuration")}:{" "}
        {formatTimestamp(
          cutType === "cut"
            ? Math.max(0, initialAVDuration - AVDuration)
            : Math.max(0, AVDuration),
        )}
      </p>
      <div className="relative mb-8 w-[600px]">
        <AVControls
          setAVCurrDurationPer={setAVCurrDurationPer}
          sliderElRef={sliderElRef}
          AVElRef={AVElRef as React.RefObject<HTMLVideoElement>}
          AVPaused={AVPaused}
        />
        <CutSlider
          AVEl={AVElRef.current}
          cutType={cutType}
          setAVDuration={setAVDuration}
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
      <CutTimestampsInput
        cutType={cutType}
        cutTimestamps={cutTimestamps}
        setCutTimestamps={setCutTimestamps}
        AVElRef={AVElRef}
        startTimestampElRef={startTimestampElRef}
        endTimestampElRef={endTimestampElRef}
      />
    </>
  );
}
