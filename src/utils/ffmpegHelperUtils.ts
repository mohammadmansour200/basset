import { Command } from "@tauri-apps/plugin-shell";

import unformatTimestamp from "./timestampUnformatter";
import { getPercentage } from "./getPercentage";

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

const getMediaDuration = async (filePath: string): Promise<number> => {
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

  return new Promise((resolve) => {
    ffprobeSidecar.stdout.on("data", (data) => {
      const mediaDuration = parseFloat(data.toString());
      resolve(mediaDuration);
    });
    ffprobeSidecar.spawn();
  });
};

const extractFFmpegProgress = (data: string, AVDuration: number) => {
  const timeRegex = /time=(\d+:\d+:\d+\.\d+)/;
  const match = data.match(timeRegex);

  if (!match) return;

  const currentEncodingProgress = unformatTimestamp(match[1]) as number;
  const progressPercentage = getPercentage(currentEncodingProgress, AVDuration);

  return progressPercentage;
};

export { getMediaDuration, getNearestTimestamp, extractFFmpegProgress };
