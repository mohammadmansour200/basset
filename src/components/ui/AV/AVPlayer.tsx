import { convertFileSrc } from "@tauri-apps/api/tauri";
import { getVidDuration } from "@/utils/ffmpeg";

import { RefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import unformatTimestamp from "@/utils/timestampUnformatter";
import formatTimestamp from "@/utils/timestampFormatter";
import { getPercentage } from "@/utils/getPercentage";

import AVControls from "./AVControls";
import { Slider } from "../shadcn/slider";

interface IAVPlayerProps {
  isAudio: boolean;
  srcPath: string;
  cutType: "trim" | "cut";
  cutTimestamps: [number, number];
  setCutTimestamps: React.Dispatch<React.SetStateAction<[number, number]>>;
}

const timestampRegex =
  /^(?:\d+(?::[0-5][0-9]:[0-5][0-9])?|[0-5]?[0-9]:[0-5][0-9])$/;

function AVPlayer({
  isAudio,
  srcPath,
  cutType,
  cutTimestamps,
  setCutTimestamps,
}: IAVPlayerProps) {
  const [AVPaused, setAVPaused] = useState(true);
  const [initialAVDuration, setInitialAVDuration] = useState(0);
  const [AVDuration, setAVDuration] = useState(0);
  const [AVCurrDurationPer, setAVCurrDurationPer] = useState(0);

  const { t } = useTranslation();

  const AVElRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const sliderElRef = useRef<HTMLInputElement>(null);
  const startTimestampElRef = useRef<HTMLInputElement>(null);
  const endTimestampElRef = useRef<HTMLInputElement>(null);

  const AVPlayerErr =
    Number.isNaN(AVElRef.current?.duration) ||
    AVElRef.current?.duration === undefined;

  useEffect(() => {
    async function getAVDuration() {
      if (AVPlayerErr) {
        await getVidDuration(srcPath, setInitialAVDuration);
      } else {
        setInitialAVDuration(AVElRef.current?.duration);
      }
    }
    getAVDuration();
  }, [AVPlayerErr, srcPath]);

  useEffect(() => {
    function setAVDurationOnMount() {
      setAVDuration(cutTimestamps[1] - cutTimestamps[0]);
    }
    setAVDurationOnMount();
  }, [cutTimestamps, initialAVDuration]);

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

  function onStartTimestampInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const startTimestamp = unformatTimestamp(e.currentTarget.value);

    if (
      timestampRegex.test(e.currentTarget.value) &&
      !Number.isNaN(startTimestamp) &&
      typeof startTimestamp === "number"
    ) {
      setCutTimestamps([startTimestamp as number, cutTimestamps[1]]);

      if (AVElRef.current) {
        if (cutType === "trim") {
          AVElRef.current.currentTime = startTimestamp;
        } else {
          if (cutTimestamps[0] === 0) {
            // If the start timestamp is 0, and current time is before the end timestamp,
            // skip to the end timestamp
            AVElRef.current.currentTime = cutTimestamps[1];
          } else {
            AVElRef.current.currentTime = 0;
          }
        }
      }
    }
  }

  function onEndTimestampInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const endTimestamp = unformatTimestamp(e.currentTarget.value);
    if (
      timestampRegex.test(e.currentTarget.value) &&
      !Number.isNaN(endTimestamp)
    ) {
      setCutTimestamps([cutTimestamps[0], endTimestamp as number]);

      if (AVElRef.current) {
        if (cutType === "trim") {
          AVElRef.current.currentTime = cutTimestamps[0];
        } else {
          if (cutTimestamps[0] === 0) {
            // If the start timestamp is 0, and current time is before the end timestamp,
            // skip to the end timestamp
            AVElRef.current.currentTime = cutTimestamps[1];
          } else {
            AVElRef.current.currentTime = 0;
          }
        }
      }
    }
  }

  function handleAVDurationAndIndicator() {
    const durationPer =
      ((AVElRef.current?.currentTime as number) /
        (AVElRef.current?.duration as number)) *
        100 || 0;

    setAVCurrDurationPer(durationPer);
    if (sliderElRef.current) {
      sliderElRef.current.style.backgroundSize = `${durationPer}% 100%`;
      sliderElRef.current.value = `${durationPer}`;
    }
  }

  useEffect(() => {
    function setInitialCutTimestamps() {
      setCutTimestamps([2, initialAVDuration - 2]);
    }
    setInitialCutTimestamps();
  }, [initialAVDuration, setCutTimestamps]);

  if (isAudio)
    return (
      <>
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 sm:w-auto">
          <p dir="auto" className="font-medium">
            {t("tabs.cutPreview")}:
          </p>
          <>
            <AVControls
              sliderElRef={sliderElRef}
              AVElRef={AVElRef as RefObject<HTMLAudioElement>}
              AVPaused={AVPaused}
              className="pointer-events-auto bg-muted opacity-100"
            />
            <audio
              src={convertFileSrc(srcPath)}
              ref={AVElRef as RefObject<HTMLAudioElement>}
              onTimeUpdate={() => {
                handleAVDurationAndIndicator();
              }}
              loop
              onPlay={() => {
                setAVPaused(false);
              }}
              onPause={() => setAVPaused(true)}
            />
          </>
        </div>
        <p>
          {t("tabs.cutOutputDuration")}:
          {formatTimestamp(
            cutType === "cut"
              ? Math.max(0, initialAVDuration - AVDuration)
              : Math.max(0, AVDuration),
          )}
        </p>
        <div className="relative mt-8 w-full">
          <p
            className="absolute -top-8 rounded-md border border-border px-2"
            style={{ left: `${AVCurrDurationPer - 3}%` }}
          >
            {formatTimestamp(AVElRef.current?.currentTime as number)}
          </p>
          <CutSlider
            AVEl={AVElRef.current}
            cutType={cutType}
            setAVDuration={setAVDuration}
            setCutTimestamps={setCutTimestamps}
            cutTimestamps={cutTimestamps}
            initialAVDuration={initialAVDuration}
          />
        </div>
        <div
          dir="ltr"
          className="flex items-start justify-start gap-2 text-center"
        >
          <input
            name="timestamp"
            onChange={onStartTimestampInputChange}
            ref={startTimestampElRef}
            type="text"
            className="flex h-7 w-10 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={formatTimestamp(cutTimestamps[0])}
          />
          :
          <input
            name="timestamp"
            ref={endTimestampElRef}
            onChange={onEndTimestampInputChange}
            type="text"
            className="flex h-7 w-10 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={formatTimestamp(cutTimestamps[1])}
          />
        </div>
      </>
    );
  else {
    return (
      <>
        <div className="flex w-[98%] flex-col sm:w-auto">
          <p dir="auto" className="font-medium">
            {t("tabs.cutPreview")}:
          </p>
          <div className="group relative mb-1 inline-flex h-full w-[600px] flex-col items-center justify-center overflow-hidden overflow-y-hidden rounded-md sm:w-auto">
            <AVControls
              sliderElRef={sliderElRef}
              AVElRef={AVElRef as RefObject<HTMLVideoElement>}
              AVPaused={AVPaused}
              className="absolute bottom-2 bg-background/75"
            />
            <video
              loop
              src={convertFileSrc(srcPath)}
              playsInline
              onTimeUpdate={() => {
                handleAVDurationAndIndicator();
              }}
              className="aspect-video h-full w-full rounded-md border-2 border-border bg-black sm:w-[600px]"
              ref={AVElRef as RefObject<HTMLVideoElement>}
              controls={false}
              onPlay={() => {
                setAVPaused(false);
              }}
              onPause={() => setAVPaused(true)}
            />
          </div>
        </div>
        <p>
          {t("tabs.cutOutputDuration")}:
          {formatTimestamp(
            cutType === "cut"
              ? Math.max(0, initialAVDuration - AVDuration)
              : Math.max(0, AVDuration),
          )}
        </p>
        <div className="relative mt-8 w-full">
          <p
            className="absolute -top-8 rounded-md border border-border px-2"
            style={{ left: `${AVCurrDurationPer - 3}%` }}
          >
            {formatTimestamp(AVElRef.current?.currentTime as number)}
          </p>
          <CutSlider
            AVEl={AVElRef.current}
            cutType={cutType}
            setAVDuration={setAVDuration}
            setCutTimestamps={setCutTimestamps}
            cutTimestamps={cutTimestamps}
            initialAVDuration={initialAVDuration}
          />
        </div>
        <div
          dir="ltr"
          className="flex items-start justify-start gap-2 text-center"
        >
          <input
            name="timestamp"
            ref={startTimestampElRef}
            onChange={onStartTimestampInputChange}
            type="text"
            className="flex h-7 w-10 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={formatTimestamp(cutTimestamps[0])}
          />
          :
          <input
            name="timestamp"
            ref={endTimestampElRef}
            onChange={onEndTimestampInputChange}
            type="text"
            className="flex h-7 w-10 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={formatTimestamp(cutTimestamps[1])}
          />
        </div>
      </>
    );
  }
}

interface ICutSliderProps {
  setAVDuration: React.Dispatch<React.SetStateAction<number>>;
  initialAVDuration: number;
  AVEl: HTMLMediaElement | null;
}
type CutSliderTypes = ICutSliderProps &
  Pick<IAVPlayerProps, "cutType" | "setCutTimestamps" | "cutTimestamps">;

function CutSlider({
  cutType,
  setAVDuration,
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
        setAVDuration(initialAVDuration * ((value[1] - value[0]) / 100));
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
        getPercentage(cutTimestamps[1], initialAVDuration),
      ]}
      defaultValue={[
        getPercentage(cutTimestamps[0] || 0, initialAVDuration),
        getPercentage(cutTimestamps[1] || 0, initialAVDuration),
      ]}
    />
  );
}

export default AVPlayer;
