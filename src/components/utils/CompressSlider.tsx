import { getPercentage } from "@/utils/getPercentage";
import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Slider } from "../ui/shadcn/slider";

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
		<div className="my-2 flex md:w-[400px] w-[90vw] flex-col items-center justify-center gap-2">
			<p className="flex items-center gap-1 bg-muted border dark:border-white border-black rounded-md p-1">
				<CircleAlert size="45px" />
				{t("tabs.compressTip")}
			</p>
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
	);
}

export default CompressSlider;
