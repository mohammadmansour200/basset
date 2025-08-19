import { audioDir, basename, join, videoDir } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  exists,
  remove,
  mkdir,
  copyFile,
} from "@tauri-apps/plugin-fs";

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  const formattedSize = parseFloat(
    (sizeInBytes / Math.pow(1024, i)).toFixed(2),
  );

  return `${formattedSize} ${sizes[i]}`;
}

export function extNameSync(file: string) {
  if (file.split(".").length === 1) return file.replace(".", "");
  return file.slice(
    (Math.max(0, file.lastIndexOf(".")) || Number.POSITIVE_INFINITY) + 1,
  );
}

export function fileTitleSync(file: string): string {
  const fileName = file.split("/").pop() || file;

  const title = fileName.split(".").slice(0, -1).join(".");

  return title || fileName;
}

export function getIsAudio(file: string) {
  const ext = extNameSync(file);
  if (
    ext === "mp3" ||
    ext === "ogg" ||
    ext === "aac" ||
    ext === "wav" ||
    ext === "m4a"
  ) {
    return true;
  } else return false;
}

export function getIsImage(file: string) {
  const ext = extNameSync(file);
  if (ext === "png" || ext === "webp" || ext === "jpg" || ext === "jpeg") {
    return true;
  } else return false;
}

export function getIsVideo(file: string) {
  const ext = extNameSync(file);
  if (
    ext === "mp4" ||
    ext === "avi" ||
    ext === "mov" ||
    ext === "mkv" ||
    ext === "wmv" ||
    ext === "flv" ||
    ext === "webm"
  ) {
    return true;
  } else return false;
}

export async function deleteMediaTemp() {
  await remove("output", {
    baseDir: BaseDirectory.AppLocalData,
    recursive: true,
  });
}

export async function copyTmpMediaToMediaDir(file: string) {
  const isAudio = getIsAudio(file);
  const mediaDirPath = await join(
    isAudio ? await audioDir() : await videoDir(),
    await basename(file),
  );
  await copyFile(file, mediaDirPath);
  await deleteMediaTemp();
}

export async function ensureDir(dir: string) {
  const dirExists = await exists(dir, {
    baseDir: BaseDirectory.AppLocalData,
  });

  if (!dirExists) {
    await mkdir(dir, { baseDir: BaseDirectory.AppLocalData });
  }
}
