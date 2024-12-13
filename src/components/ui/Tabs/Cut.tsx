import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getNearestTimestamp } from "@/utils/ffmpegHelperUtils";

import AVPlayer from "../AVPlayer/AVPlayer";
import ExecuteBtn from "@/components/ui/ExecuteBtn";
import { useFileStore } from "@/stores/useFileStore";

function Cut() {
  const [cutTimestamps, setCutTimestamps] = useState<[number, number]>([
    0, 100,
  ]);
  const [txtFilePath, setTxtFilePath] = useState("");

  const { t } = useTranslation();
  const { filePath } = useFileStore();

  //this text file basically is for the cutting timestamps
  useEffect(() => {
    async function getTxtFilePath() {
      const txtFilePath = await appLocalDataDir();
      const path = await join(txtFilePath, "inputTxtFiles");
      setTxtFilePath(path);
    }
    getTxtFilePath();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <AVPlayer
        cutType="cut"
        cutTimestamps={cutTimestamps}
        setCutTimestamps={setCutTimestamps}
      />
      <ExecuteBtn
        text={t("tabs.cutBtn")}
        customFunction={async () => {
          const { nearestTS1, nearestTS2 } = await getNearestTimestamp(
            filePath,
            cutTimestamps,
          );
          await writeTextFile(
            "inputTxtFiles/input.txt",
            `file '${filePath}'
outpoint ${nearestTS1}
file '${filePath}'
inpoint ${nearestTS2}`,
            {
              baseDir: BaseDirectory.AppLocalData,
            },
          );
        }}
        command={[
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          `${txtFilePath}/input.txt`,
          "-c",
          "copy",
        ]}
      />
    </div>
  );
}

export default Cut;
