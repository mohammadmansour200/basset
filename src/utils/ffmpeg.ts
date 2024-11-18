import React, { Dispatch } from "react";
import { t } from "i18next";

import { Child, Command } from "@tauri-apps/plugin-shell";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import unformatTimestamp from "./timestampUnformatter";
import { getPercentage } from "./getPercentage";
import { copyTmpMediaToMediaDir, deleteMediaTemp } from "./fsUtils";

let mediaDuration = 0;
let ffmpeg: Child;

//This is crucial for not having a jitter and frame freeze for cutting Media files in ffmpeg without re-encoding
const getNearestTimestamp = async (
  filePath: string,
  cutTimestamps: [number, number],
) => {
  const nearestTimestampCmd = (cutTimestamp: number) => {
    return [
      "-read_intervals",
      `${cutTimestamp + 2}%${cutTimestamp + 2}`,
      "-v",
      "error",
      "-skip_frame",
      "nokey",
      "-show_entries",
      "frame=pkt_pts_time",
      "-select_streams",
      "v",
      "-of",
      "csv=p=0",
      filePath,
    ];
  };

  // Function to execute ffprobe and return nearest timestamp
  const executeFfprobe = async (cmd: string[]) => {
    return new Promise<number>((resolve) => {
      const ffprobe = Command.sidecar("bin/ffprobe", cmd);

      ffprobe.stdout.on("data", (data) => {
        const nearestTimestamp = parseFloat(data.toString());
        resolve(nearestTimestamp);
      });

      ffprobe.spawn();
    });
  };

  const nearestTSTask1 = executeFfprobe(nearestTimestampCmd(cutTimestamps[0]));

  const nearestTSTask2 = executeFfprobe(nearestTimestampCmd(cutTimestamps[1]));

  // Wait for both tasks to complete
  const [nearestTS1, nearestTS2] = await Promise.all([
    nearestTSTask1,
    nearestTSTask2,
  ]);

  return { nearestTS1, nearestTS2 };
};

const getMediaDuration = async (
  filePath: string,
  setAVDuration?: (duration: number) => void,
) => {
  const durationCmd = [
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

  const ffprobeSidecar = Command.sidecar("bin/ffprobe", durationCmd);

  ffprobeSidecar.stdout.on("data", (data) => {
    mediaDuration = parseFloat(data.toString());
    if (setAVDuration) {
      setAVDuration(parseFloat(data.toString()));
    }
  });

  await ffprobeSidecar.spawn();
};

const runFFmpeg = async (
  command: string[],
  setCmdStatus: Dispatch<React.SetStateAction<"success" | "error" | undefined>>,
  setProgress: Dispatch<React.SetStateAction<number>>,
  setErrInfo: Dispatch<React.SetStateAction<string>>,
  setCmdProcessing: Dispatch<React.SetStateAction<boolean>>,
  filePath: string,
  outputPath: string,
) => {
  if (mediaDuration === 0) {
    getMediaDuration(filePath);
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
    console.log(error);
  });

  ffmpegSidecar.stderr.on("data", (data) => {
    const progress = extractProgress(data.toString(), mediaDuration);
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

const killFFmpeg = async () => {
  try {
    await ffmpeg.kill();
    await deleteMediaTemp();
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
export { runFFmpeg, killFFmpeg, getMediaDuration, getNearestTimestamp };
