import { Child, Command } from "@tauri-apps/plugin-shell";
import React, { Dispatch } from "react";
import unformatTimestamp from "./timestampUnformatter";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { t } from "i18next";
import { getPercentage } from "./getPercentage";

let videoDuration = 0;
let ffmpeg: Child;
let ffprobe: Child;

const getVidDuration = async (
  filePath: string,
  setAVDuration?: Dispatch<React.SetStateAction<number>>,
) => {
  const videoDurationCmd = [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ];

  const ffprobeSidecar = Command.sidecar("bin/ffprobe", videoDurationCmd);

  ffprobeSidecar.stdout.on("data", (data) => {
    videoDuration = parseFloat(data.toString());
    if (setAVDuration) {
      setAVDuration(parseFloat(data.toString()));
    }
  });

  ffprobe = await ffprobeSidecar.spawn();
};

const runCommand = async (
  command: string[],
  setCmdStatus: Dispatch<React.SetStateAction<"success" | "error" | undefined>>,
  setProgress: Dispatch<React.SetStateAction<number>>,
  setErrInfo: Dispatch<React.SetStateAction<string>>,
  filePath: string,
  outputPath: string,
) => {
  if (videoDuration === 0) {
    getVidDuration(filePath);
  }

  const ffmpegSidecar = Command.sidecar("bin/ffmpeg", [
    "-y",
    ...command,
    outputPath,
  ]);

  ffmpegSidecar.on("close", async ({ code }) => {
    if (code) {
      setCmdStatus("error");
    } else {
      setCmdStatus("success");
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
    console.log(error);
  });

  ffmpegSidecar.stderr.on("data", (data) => {
    const progress = extractProgress(data.toString(), videoDuration);
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

  ffmpeg = await ffmpegSidecar.spawn();
};

const killCommand = () => {
  try {
    ffmpeg.kill();
    if (videoDuration === 0) {
      ffprobe.kill();
    }
  } catch (err) {
    console.log(err);
  }
};

function extractProgress(data: string, AVDuration: number) {
  const timeRegex = /time=(\d+:\d+:\d+\.\d+)/;
  const match = data.match(timeRegex);

  if (!match) return;

  const currentEncodingProgress = unformatTimestamp(match[1]) as number;
  const progressPercentage = getPercentage(currentEncodingProgress, AVDuration);

  return progressPercentage;
}
export { runCommand, killCommand, getVidDuration };
