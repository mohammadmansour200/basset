import { useState } from "react";
import { useTranslation } from "react-i18next";

import formatTimestamp from "@/utils/timestampFormatter";
import { useFile } from "@/contexts/FileProvider";

import AVPlayer from "../AVPlayer/AVPlayer";
import ExecuteBtn from "@/components/ui/ExecuteBtn";

interface TrimProps {
  setCmdProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

function Trim({ setCmdProcessing }: TrimProps) {
  const [cutTimestamps, setCutTimestamps] = useState<[number, number]>([
    0, 100,
  ]);
  const { t } = useTranslation();
  const { filePath } = useFile();

  return (
    <div className="flex flex-col items-center gap-2">
      <AVPlayer
        cutType="trim"
        cutTimestamps={cutTimestamps}
        setCutTimestamps={setCutTimestamps}
      />
      <ExecuteBtn
        setCmdProcessing={setCmdProcessing}
        text={t("tabs.cutBtn")}
        command={[
          "-ss",
          `${formatTimestamp(cutTimestamps[0])}`,
          "-to",
          `${formatTimestamp(cutTimestamps[1])}`,
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
