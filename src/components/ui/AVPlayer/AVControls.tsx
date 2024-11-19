import { RefObject, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Ripple } from "react-ripple-click";
import CutTimestampsInput from "./CutTimestampsInput";
import { Select, SelectItem, SelectContent, SelectTrigger } from "../Select";

interface Props {
  AVElRef: RefObject<HTMLVideoElement> | RefObject<HTMLAudioElement>;
  sliderElRef: RefObject<HTMLInputElement>;
  AVPaused: boolean;
  setAVCurrDurationPer: React.Dispatch<React.SetStateAction<number>>;
  cutType: "cut" | "trim";
  cutTimestamps: [number, number];
  setCutTimestamps: React.Dispatch<React.SetStateAction<[number, number]>>;
  startTimestampElRef: RefObject<HTMLInputElement>;
  endTimestampElRef: RefObject<HTMLInputElement>;
}
function AVControls({
  AVElRef,
  sliderElRef,
  AVPaused,
  setAVCurrDurationPer,
  cutType,
  cutTimestamps,
  setCutTimestamps,
  startTimestampElRef,
  endTimestampElRef,
}: Props) {
  const AVControlsElRef = useRef<HTMLDivElement>(null);

  //AV play and pause toggle
  function playPauseToggle() {
    AVPaused === true ? AVElRef.current?.play() : AVElRef.current?.pause();
  }

  //Handle slider input sliding
  function onSliderInput(e: React.FormEvent<HTMLInputElement>) {
    const currentValue = Number(e.currentTarget.value);

    if (!AVElRef.current) return;
    if (!sliderElRef.current) return;
    // Convert percentage to seconds
    const timeInSeconds = (currentValue / 100) * AVElRef.current.duration;

    if (cutType === "cut") {
      // prevent entering the cut region
      if (
        timeInSeconds > cutTimestamps[0] &&
        timeInSeconds < cutTimestamps[1]
      ) {
        // If coming from left, snap to left boundary
        if (AVElRef.current.currentTime <= cutTimestamps[0]) {
          const startPercentage =
            (cutTimestamps[0] / AVElRef.current.duration) * 100;
          setAVCurrDurationPer(startPercentage);

          sliderElRef.current.value = String(startPercentage);

          AVElRef.current.currentTime = cutTimestamps[0];
        } else {
          // If coming from right, snap to right boundary
          const endPercentage =
            (cutTimestamps[1] / AVElRef.current.duration) * 100;
          setAVCurrDurationPer(endPercentage);

          sliderElRef.current.value = String(endPercentage);

          AVElRef.current.currentTime = cutTimestamps[1];
        }
        return;
      }
    } else {
      // Original cutting logic
      if (timeInSeconds < cutTimestamps[0]) {
        const startPercentage =
          (cutTimestamps[0] / AVElRef.current.duration) * 100;
        setAVCurrDurationPer(startPercentage);

        sliderElRef.current.value = String(startPercentage);

        AVElRef.current.currentTime = cutTimestamps[0];
        return;
      }

      if (timeInSeconds > cutTimestamps[1]) {
        const endPercentage =
          (cutTimestamps[1] / AVElRef.current.duration) * 100;
        setAVCurrDurationPer(endPercentage);

        sliderElRef.current.value = String(endPercentage);

        AVElRef.current.currentTime = cutTimestamps[1];
        return;
      }
    }

    // If within allowed region, proceed normally
    setAVCurrDurationPer(currentValue);
    if (sliderElRef.current) {
      sliderElRef.current.value = String(currentValue);
    }
    AVElRef.current.currentTime = timeInSeconds;
  }

  return (
    <div
      dir="ltr"
      ref={AVControlsElRef}
      className="z-[5] mb-2 flex items-center gap-1 rounded-md opacity-100 backdrop-blur"
    >
      <div className="flex w-full flex-col items-center justify-center">
        <div className="mb-3 flex w-full flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-1">
            <button
              onClick={playPauseToggle}
              className="cubic h-fit rounded-full p-2 duration-200 active:scale-90"
            >
              {!AVPaused ? <PauseBtn /> : <PlayBtn />}
            </button>
            <Select
              onValueChange={(value) => {
                if (AVElRef.current)
                  AVElRef.current.playbackRate = parseFloat(value);
              }}
            >
              <SelectTrigger className="ripple cubic h-fit rounded-full p-2 duration-200">
                <Ripple />
                <PlaybackSpeedBtn />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="1.25">1.25</SelectItem>
                <SelectItem value="1.5">1.5</SelectItem>
                <SelectItem value="1.75">1.75</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="2.5">2.5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <CutTimestampsInput
              cutType={cutType}
              cutTimestamps={cutTimestamps}
              setCutTimestamps={setCutTimestamps}
              startTimestampElRef={startTimestampElRef}
              endTimestampElRef={endTimestampElRef}
              AVElRef={AVElRef}
            />
          </div>
        </div>
        <div className="relative flex w-full items-center">
          {/* AV slider */}
          <input
            onInput={onSliderInput}
            max="100"
            min="0"
            step="0.01"
            type="range"
            ref={sliderElRef}
            defaultValue="0"
            className="absolute z-[4] h-[8px] w-full cursor-pointer select-none appearance-none rounded-2xl bg-muted opacity-40"
          />
        </div>
      </div>
    </div>
  );
}

function PauseBtn() {
  const { t } = useTranslation();
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="size-[19px] sm:size-[22px]"
      viewBox="0 0 30 30"
      xmlSpace="preserve"
      fill="currentColor"
    >
      <title>{t("playBtnTitle")}</title>
      <g>
        <path
          d="M7,5.8c-0.7,0-1.2,0.5-1.2,1v19.5c0,0.6,0.5,1,1.2,1h3.8c0.7,0,1.2-0.5,1.2-1V6.8c0-0.6-0.5-1-1.2-1C10.9,5.8,7,5.8,7,5.8z
M19.1,5.8c-0.7,0-1.2,0.5-1.2,1v19.5c0,0.6,0.5,1,1.2,1H23c0.7,0,1.2-0.5,1.2-1V6.8c0-0.6-0.5-1-1.2-1H19.1z"
        />
      </g>
    </svg>
  );
}

function PlayBtn() {
  const { t } = useTranslation();
  return (
    <svg
      fill="currentColor"
      viewBox="-7 0 32 32"
      className="size-[19px] sm:size-[22px]"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{t("playBtnTitle")}</title>
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path d="M0 6.688v18.906c0 0.344 0.156 0.625 0.469 0.813 0.125 0.094 0.344 0.125 0.5 0.125s0.281-0.031 0.438-0.125l16.375-9.438c0.313-0.219 0.5-0.5 0.5-0.844 0-0.313-0.188-0.594-0.5-0.813l-16.375-9.438c-0.563-0.406-1.406 0.094-1.406 0.813z"></path>
      </g>
    </svg>
  );
}

function PlaybackSpeedBtn() {
  const { t } = useTranslation();
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[19px] sm:size-[22px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{t("playbackSpeedBtnTitle")}</title>
      <g></g>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M9.60751 1.51737C10.3776 1.34229 11.1785 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C11.1785 22.75 10.3776 22.6577 9.60751 22.4826C9.2036 22.3908 8.95061 21.9889 9.04244 21.585C9.13427 21.1811 9.53614 20.9281 9.94005 21.02C10.6018 21.1704 11.2911 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C11.2911 2.75 10.6018 2.8296 9.94005 2.98004C9.53614 3.07187 9.13427 2.81888 9.04244 2.41497C8.95061 2.01106 9.2036 1.60919 9.60751 1.51737Z"
          fill="currentColor"
        ></path>
        <path
          d="M7.31372 3.13198C7.53443 3.4825 7.42919 3.94557 7.07868 4.16627C5.90349 4.90623 4.90623 5.90349 4.16627 7.07868C3.94556 7.42919 3.4825 7.53443 3.13198 7.31372C2.78146 7.09302 2.67623 6.62995 2.89693 6.27944C3.75646 4.91436 4.91436 3.75646 6.27943 2.89693C6.62995 2.67623 7.09302 2.78146 7.31372 3.13198Z"
          fill="currentColor"
        ></path>
        <path
          d="M2.98004 9.94005C3.07187 9.53614 2.81888 9.13427 2.41497 9.04244C2.01106 8.95061 1.60919 9.2036 1.51737 9.60751C1.34229 10.3776 1.25 11.1785 1.25 12C1.25 12.8215 1.34229 13.6224 1.51737 14.3925C1.60919 14.7964 2.01106 15.0494 2.41497 14.9576C2.81888 14.8657 3.07187 14.4639 2.98004 14.06C2.8296 13.3982 2.75 12.7089 2.75 12C2.75 11.2911 2.8296 10.6018 2.98004 9.94005Z"
          fill="currentColor"
        ></path>
        <path
          d="M3.13198 16.6863C3.4825 16.4656 3.94557 16.5708 4.16627 16.9213C4.90623 18.0965 5.90349 19.0938 7.07868 19.8337C7.42919 20.0544 7.53443 20.5175 7.31372 20.868C7.09302 21.2185 6.62995 21.3238 6.27944 21.1031C4.91436 20.2435 3.75646 19.0856 2.89693 17.7206C2.67623 17.37 2.78146 16.907 3.13198 16.6863Z"
          fill="currentColor"
        ></path>
        <path
          d="M15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941Z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  );
}

export default AVControls;
