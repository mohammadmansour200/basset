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
  const [cmdStatus, setCmdStatus] = useState<"success" | "error">();
  const [errInfo, setErrInfo] = useState("");
  const [progress, setProgress] = useState(0);

  const { duration } = useFileStore();
  const { setCmdProcessing } = useOperationStore();

  const { setProcess, setLogs, process } = useOperationStore();

  async function runFFmpeg(command: string[], outputPath: string) {
    setLogs([]);
    setCmdStatus(undefined);
    setProgress(0);
    setCmdProcessing(true);
    const ffmpegSidecar = ffmpeg(["-y", ...command, outputPath]);

    ffmpegSidecar.on("close", async ({ code }) => {
      if (code === 0) {
        await copyTmpMediaToMediaDir(outputPath);
        setCmdStatus("success");
        setCmdProcessing(false);
        const permissionGranted = await isPermissionGranted();

        if (permissionGranted) {
          sendNotification({
            title: t("successTitle"),
            body: t("successBody"),
          });
        }
      } else {
        setCmdStatus("error");
        setCmdProcessing(false);
      }
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

      const inputErrRegex = /Error opening input/;
      const somethingWentWrongRegex = /Conversion failed/;
      const outputErrRegex = /Error opening output/;
      const streamErrRegex = /Output file does not contain any stream/;
      if (data.match(inputErrRegex)) setErrInfo(t("inputErr"));

      if (data.match(outputErrRegex)) setErrInfo(t("outputErr"));

      if (data.match(somethingWentWrongRegex))
        setErrInfo(t("somethingWentWrongErr"));

      if (data.match(streamErrRegex) || data.match(outputErrRegex))
        setErrInfo(t("streamErr"));
    });

    setProcess(await ffmpegSidecar.spawn());
  }

  async function killFFmpeg() {
    try {
      setCmdProcessing(false);
      setCmdStatus(undefined);
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
