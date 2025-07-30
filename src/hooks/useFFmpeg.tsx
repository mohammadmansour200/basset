import { useState } from "react";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import { copyTmpMediaToMediaDir, deleteMediaTemp } from "@/utils/fsUtils";
import { extractFFmpegProgress } from "@/utils/ffmpegHelperUtils";

import { useTranslation } from "react-i18next";
import { useOperationStore } from "@/stores/useOperationStore";
import { useFileStore } from "@/stores/useFileStore";
import { ffmpeg } from "@/utils/command";

function useFFmpeg() {
  const { t } = useTranslation();
  const [cmdStatus, setCmdStatus] = useState<"success" | "error" | null>(null);
  const [errInfo, setErrInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { duration } = useFileStore();
  const { setCmdProcessing } = useOperationStore();

  const { setProcess, setLogs, process } = useOperationStore();

  async function runFFmpeg(command: string[], outputPath: string) {
    setLogs([]);
    setCmdStatus(null);
    setProgress(0);
    setCmdProcessing(true);
    const ffmpegSidecar = ffmpeg(["-y", ...command, outputPath]);

    ffmpegSidecar.on("close", async ({ code, signal }) => {
      if (code === 0) {
        await copyTmpMediaToMediaDir(outputPath);
        setCmdStatus("success");
        const permissionGranted = await isPermissionGranted();

        if (permissionGranted) {
          sendNotification({
            title: t("successTitle"),
            body: t("successBody"),
          });
        }
      } else if (signal !== 2 && signal !== 15 && signal !== 9) {
        setCmdStatus("error");
      }
      setCmdProcessing(false);
    });

    ffmpegSidecar.on("error", (error) => {
      setLogs(error);

      setCmdStatus("error");
      setCmdProcessing(false);
      console.log(error);
    });

    ffmpegSidecar.stdout.on("data", (data) => {
      setLogs(data);
    });

    ffmpegSidecar.stderr.on("data", (data) => {
      setLogs(data);
      const progress = extractFFmpegProgress(data.toString(), duration);
      if (progress !== undefined) {
        setProgress(progress);
      }

      const errorPatterns = [
        {
          regex: /No such file or directory/i,
          key: "inputFileErr",
        },
        {
          regex: /Could not open file/i,
          key: "inputFileErr",
        },
        {
          regex: /Invalid data found when processing input/i,
          key: "invalidFormatErr",
        },
        {
          regex: /No space left on device/i,
          key: "outputFileErr",
        },
        {
          regex: /Output file #0 does not contain any stream/i,
          key: "outputFileErr",
        },
      ];

      const matchedError = errorPatterns.find((pattern) =>
        data.match(pattern.regex),
      );

      if (matchedError) {
        setErrInfo(matchedError.key);
      }
    });

    setProcess(await ffmpegSidecar.spawn());
  }

  async function killFFmpeg() {
    try {
      setCmdProcessing(false);
      setCmdStatus(null);
      setProgress(0);
      setErrInfo("");
      if (process) {
        await process.kill();
        await deleteMediaTemp();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return { killFFmpeg, runFFmpeg, cmdStatus, progress, errInfo };
}

export default useFFmpeg;
