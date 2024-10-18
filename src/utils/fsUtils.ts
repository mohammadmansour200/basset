import { audioDir, basename, join, videoDir } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  exists,
  remove,
  mkdir,
  copyFile,
} from "@tauri-apps/plugin-fs";

export function extNameSync(file: string) {
  return file.slice(
    (Math.max(0, file.lastIndexOf(".")) || Number.POSITIVE_INFINITY) + 1,
  );
}

export function getIsAudio(file: string) {
  const ext = extNameSync(file);
  if (ext === "mp3" || ext === "ogg" || ext === "aac" || ext === "wav") {
    return true;
  } else return false;
}

export async function deleteMediaTemp() {
  await remove("output/", {
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
