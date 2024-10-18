import formatTimestamp from "@/utils/timestampFormatter";
import unformatTimestamp from "@/utils/timestampUnformatter";

const timestampRegex =
  /^(?:\d+(?::[0-5][0-9]:[0-5][0-9])?|[0-5]?[0-9]:[0-5][0-9])$/;

interface CutTimestampsInputProps {
  cutType: "trim" | "cut";
  cutTimestamps: [number, number];
  setCutTimestamps: React.Dispatch<React.SetStateAction<[number, number]>>;
  AVElRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
  startTimestampElRef: React.RefObject<HTMLInputElement>;
  endTimestampElRef: React.RefObject<HTMLInputElement>;
}

export default function CutTimestampsInput({
  cutType,
  cutTimestamps,
  setCutTimestamps,
  AVElRef,
  startTimestampElRef,
  endTimestampElRef,
}: CutTimestampsInputProps) {
  function onStartTimestampInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (timestampRegex.test(e.currentTarget.value)) {
      const startTimestamp = unformatTimestamp(e.currentTarget.value);
      setCutTimestamps([startTimestamp as number, cutTimestamps[1]]);

      if (!AVElRef.current) return;

      if (cutType === "trim") {
        AVElRef.current.currentTime = startTimestamp as number;
      } else {
        // If the start timestamp is 0, and current time is before the end timestamp,
        // skip to the end timestamp
        cutTimestamps[0] === 0
          ? (AVElRef.current.currentTime = cutTimestamps[1])
          : (AVElRef.current.currentTime = 0);
      }
    }
  }

  function onEndTimestampInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (timestampRegex.test(e.currentTarget.value)) {
      const endTimestamp = unformatTimestamp(e.currentTarget.value);
      setCutTimestamps([cutTimestamps[0], endTimestamp as number]);

      if (!AVElRef.current) return;

      if (cutType === "trim") {
        AVElRef.current.currentTime = cutTimestamps[0];
      } else {
        // If the start timestamp is 0, and current time is before the end timestamp,
        // skip to the end timestamp
        cutTimestamps[0] === 0
          ? (AVElRef.current.currentTime = cutTimestamps[1])
          : (AVElRef.current.currentTime = 0);
      }
    }
  }

  return (
    <div dir="ltr" className="flex items-start justify-start gap-2 text-center">
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
  );
}
