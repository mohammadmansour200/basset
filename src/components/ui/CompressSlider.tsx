import { useTranslation } from "react-i18next";

import { getPercentage } from "@/utils/getPercentage";

import { Slider } from "./Slider";
import { Alert, AlertDescription } from "./Alert";

interface CompressSliderProps {
  setCompressRate: React.Dispatch<React.SetStateAction<number>>;
  compressRate: number;
}

function CompressSlider({
  setCompressRate,
  compressRate,
}: CompressSliderProps) {
  const { t } = useTranslation();

  const compressPercentage = Math.trunc(getPercentage(compressRate, 25));

  return (
    <>
      <Alert className="flex flex-row gap-1">
        <img
          draggable={false}
          src="src/assets/pin.png"
          width="38"
          height="38"
          className="object-contain"
        />
        <AlertDescription>{t("tabs.compressTip")}</AlertDescription>
      </Alert>
      <div className="my-2 flex w-[400px] flex-col items-center justify-center gap-4">
        <Slider
          onValueChange={(value) => setCompressRate(Number(value))}
          min={0}
          step={0.2}
          max={25}
          defaultValue={[8]}
        />
        <p className="w-[20%] rounded-md border border-border text-center">
          {compressPercentage}%
        </p>
      </div>
    </>
  );
}

export default CompressSlider;
