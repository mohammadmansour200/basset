import { useState } from "react";
import { useTranslation } from "react-i18next";

import formatTimestamp from "@/utils/timestampFormatter";

import AVPlayer from "../AVPlayer/AVPlayer";
import ExecuteBtn from "@/components/ui/ExecuteBtn";
import { useFileStore } from "@/stores/useFileStore";
import { arabicNums2EnglishNums } from "@/utils/ffmpegHelperUtils";

function Trim() {
  const [cutTimestamps, setCutTimestamps] = useState<[number, number]>([
    0, 100,
  ]);
  const { t } = useTranslation();
  const { filePath } = useFileStore();

  return (
    <div className="flex flex-col items-center gap-2">
      <AVPlayer
        cutType="trim"
        cutTimestamps={cutTimestamps}
        setCutTimestamps={setCutTimestamps}
      />
      <ExecuteBtn
        text={t("operations.cutBtn")}
        command={[
          "-ss",
          `${formatTimestamp(arabicNums2EnglishNums(cutTimestamps[0]))}`,
          "-to",
          `${formatTimestamp(arabicNums2EnglishNums(cutTimestamps[1]))}`,
          "-i",
          `${filePath}`,
          "-c",
          "copy",
        ]}
      />
    </div>
  );
}

export default Trim;
