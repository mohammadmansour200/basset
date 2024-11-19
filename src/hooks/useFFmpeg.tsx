import { useState } from "react";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { Child, Command } from "@tauri-apps/plugin-shell";

import { copyTmpMediaToMediaDir, deleteMediaTemp } from "@/utils/fsUtils";
import { extractFFmpegProgress } from "@/utils/ffmpegHelperUtils";

import { useFile } from "@/contexts/FileProvider";
import { useTranslation } from "react-i18next";

function useFFmpeg() {
  const { t } = useTranslation();
  const [cmdStatus, setCmdStatus] = useState<"success" | "error">();
  const [errInfo, setErrInfo] = useState("");
  const [progress, setProgress] = useState(0);

  const { duration, setCmdProcessing } = useFile();

  const [ffmpeg, setFfmpeg] = useState<Child>();

  async function runFFmpeg(command: string[], outputPath: string) {
    setCmdStatus(undefined);
    setProgress(0);
    setCmdProcessing(true);
    const ffmpegSidecar = Command.sidecar("bin/ffmpeg", [
      "-y",
      ...command,
      outputPath,
    ]);

    ffmpegSidecar.on("close", async ({ code }) => {
      if (code) {
        setCmdStatus("error");
        setCmdProcessing(false);
      } else {
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
      }
    });

    ffmpegSidecar.on("error", (error) => {
      setCmdStatus("error");
      setCmdProcessing(false);
      console.log(error);
    });

    ffmpegSidecar.stderr.on("data", (data) => {
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

    setFfmpeg(await ffmpegSidecar.spawn());
  }

  async function killFFmpeg() {
    try {
      setCmdProcessing(false);
      setCmdStatus(undefined);
      setProgress(0);
      setErrInfo("");
      if (ffmpeg) {
        await ffmpeg.kill();
        await deleteMediaTemp();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return { killFFmpeg, runFFmpeg, cmdStatus, progress, errInfo };
}

export default useFFmpeg;
