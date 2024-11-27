import { platform } from "@tauri-apps/plugin-os";
import { Command } from "@tauri-apps/plugin-shell";

export const ffmpeg = (cmd: string[]) => {
  if (platform() === "linux") return Command.create("ffmpeg", cmd);
  else return Command.sidecar("bin/ffmpeg", cmd);
};

export const ffprobe = (cmd: string[]) => {
  if (platform() === "linux") return Command.create("ffprobe", cmd);
  else return Command.sidecar("bin/ffprobe", cmd);
};
