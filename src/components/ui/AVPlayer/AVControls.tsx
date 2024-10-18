import { RefObject, useRef } from "react";

import { Ripple } from "react-ripple-click";

interface Props {
  AVElRef: RefObject<HTMLVideoElement> | RefObject<HTMLAudioElement>;
  sliderElRef: RefObject<HTMLInputElement>;
  AVPaused: boolean;
  setAVCurrDurationPer: React.Dispatch<React.SetStateAction<number>>;
}
function AVControls({
  AVElRef,
  sliderElRef,
  AVPaused,
  setAVCurrDurationPer,
}: Props) {
  const AVControlsElRef = useRef<HTMLDivElement>(null);

  //AV play and pause toggle
  function playPauseToggle() {
    AVPaused === true ? AVElRef.current?.play() : AVElRef.current?.pause();
  }

  //Handle slider input sliding
  function onSliderInput(e: React.FormEvent<HTMLInputElement>) {
    setAVCurrDurationPer(Number(e.currentTarget.value));
    if (sliderElRef.current) {
      sliderElRef.current.value = e.currentTarget.value;
    }
    if (AVElRef.current) {
      AVElRef.current.currentTime =
        (Number(e.currentTarget.value) / 100) * AVElRef.current.duration || 0;
    }
  }

  return (
    <div
      dir="ltr"
      ref={AVControlsElRef}
      className="z-[5] mb-2 flex items-center gap-1 rounded-md opacity-100 backdrop-blur"
    >
      <div className="flex w-full flex-col items-center justify-center">
        {/* Play button  */}
        <div className="mb-2">
          <button
            onClick={playPauseToggle}
            className="ripple cubic h-fit rounded-full p-2 duration-200 active:scale-90"
          >
            <Ripple />
            {!AVPaused ? <PauseBtn /> : <PlayBtn />}
          </button>
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
  return (
    <svg
      fill="currentColor"
      viewBox="-7 0 32 32"
      className="size-[19px] sm:size-[22px]"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path d="M0 6.688v18.906c0 0.344 0.156 0.625 0.469 0.813 0.125 0.094 0.344 0.125 0.5 0.125s0.281-0.031 0.438-0.125l16.375-9.438c0.313-0.219 0.5-0.5 0.5-0.844 0-0.313-0.188-0.594-0.5-0.813l-16.375-9.438c-0.563-0.406-1.406 0.094-1.406 0.813z"></path>
      </g>
    </svg>
  );
}

export default AVControls;
