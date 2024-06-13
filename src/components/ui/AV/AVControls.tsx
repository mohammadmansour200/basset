import { RefObject, useRef } from "react";

import { cn } from "@/lib/utils";

import { Ripple } from "react-ripple-click";

interface IProps {
  AVElRef: RefObject<HTMLVideoElement> | RefObject<HTMLAudioElement>;
  sliderElRef: RefObject<HTMLInputElement>;
  AVPaused: boolean;
  className: string;
}
function AVControls({ AVElRef, sliderElRef, AVPaused, className }: IProps) {
  const AVControlsElRef = useRef<HTMLDivElement>(null);

  //AV play and pause toggle
  function playPauseToggle() {
    if (AVPaused === true) {
      AVElRef.current?.play();
    } else {
      AVElRef.current?.pause();
    }
  }

  //Handle slider input sliding
  function onSliderInput(e: React.FormEvent<HTMLInputElement>) {
    if (sliderElRef.current) {
      sliderElRef.current.style.backgroundSize = `${e.currentTarget.value}% 100%`;
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
      className={cn(
        "cubic group-hover:pointer-fine:pointer-events-auto group-hover:pointer-fine:opacity-100 z-[5] flex w-[90%] flex-col items-center gap-1 rounded-md p-2 opacity-100 backdrop-blur duration-300 group-focus-within:pointer-events-auto group-focus-within:opacity-100 sm:w-[570px]",
        className,
      )}
    >
      {/* AV upper controls */}
      <div className="flex w-full items-center justify-center">
        {/* Play button  */}
        <div>
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
            className="absolute z-[4] h-[6px] w-full cursor-pointer select-none appearance-none rounded-2xl bg-foreground/50 bg-gradient-to-r from-foreground to-foreground bg-[length:0%_100%] bg-no-repeat"
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
