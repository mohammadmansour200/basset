import { getPercentage } from "@/utils/getPercentage";
import { Slider } from "../ui/shadcn/slider";
import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ICompressSliderProps {
  setCompressRate: React.Dispatch<React.SetStateAction<number>>;
  compressRate: number;
}

function CompressSlider({
  setCompressRate,
  compressRate,
}: ICompressSliderProps) {
  const { t } = useTranslation();

  const compressPercentage = Math.trunc(getPercentage(compressRate, 25));

  return (
    <div className="my-2 flex w-[400px] flex-col items-center justify-center gap-2">
      <p className="flex items-center gap-1">
        <CircleAlert size={22} />
        {t("tabs.compressTip")}
      </p>
      <Slider
        onValueChange={(value) => setCompressRate(Number(value))}
        min={0}
        max={25}
        defaultValue={[4]}
      />
      <p className="w-[20%] rounded-md border border-border text-center">
        {compressPercentage}%
      </p>
    </div>
  );
}

export default CompressSlider;
