import { join, appLocalDataDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import { copyTmpMediaToMediaDir, extNameSync, getIsAudio } from "./fsUtils";

import { t } from "i18next";

export class SpleeterHelper {
  private filepath: string;
  private finalOutputName: string;

  constructor(filepath: string, finalOutputName: string) {
    this.filepath = filepath;
    this.finalOutputName = finalOutputName;
  }

  /**
   * Preprocesses the file and converts it to .pcm format.
   *
   * This is crucial, because spleeter only understands .pcm format.
   *
   * @returns Preprocessed .pcm file path
   */
  async preprocessFile() {
    const tempFolder = await appLocalDataDir();
    const outputFolder = await join(
      tempFolder,
      "output",
      "spleeter",
      "preprocessed.pcm",
    );
    const ffmpegSidecar = Command.sidecar("bin/ffmpeg", [
      "-y",
      "-i",
      this.filepath,
      "-f",
      "f32le",
      "-acodec",
      "pcm_f32le",
      "-ac",
      "2",
      "-ar",
      "44100",
      outputFolder,
    ]);

    await ffmpegSidecar.spawn();
    return outputFolder;
  }

  /**
   * In case the input file was a video file, we exchange its previous audio track with the processed audio file.
   * @private
   */
  private async exchangeVideoAudioTrack(outputFile: string) {
    const finalTmpOutputFile = outputFile.replace(
      extNameSync(outputFile),
      extNameSync(this.finalOutputName),
    );

    const ffmpegSidecar = Command.sidecar("bin/ffmpeg", [
      "-y",
      "-an",
      "-i",
      this.filepath,
      "-i",
      outputFile,
      "-map",
      "0:v",
      "-map",
      "1:a",
      "-c:v",
      "copy",
      "-c:a",
      "copy",
      finalTmpOutputFile,
    ]);

    ffmpegSidecar.on("close", async () => {
      await copyTmpMediaToMediaDir(finalTmpOutputFile);
    });

    await ffmpegSidecar.spawn();
  }

  /**
   * Converts processed .pcm file to either:
   * - .aac in case the input file is video
   * - the input's format in case the file is audio
   * @private
   */
  private async convertPcmFile(
    processedPcmFilePath: string,
    setCmdStatus: React.Dispatch<
      React.SetStateAction<"success" | "error" | undefined>
    >,
    setCmdProcessing: (processing: boolean) => void,
  ) {
    const processedPcmFile = await join(processedPcmFilePath, "processed.pcm");

    const isAudio = getIsAudio(this.finalOutputName);
    const outputFile = await join(
      processedPcmFilePath,
      `${this.finalOutputName.replace(`.${extNameSync(this.finalOutputName)}`, "")}.${isAudio ? extNameSync(this.finalOutputName) : "aac"}`,
    );

    const ffmpegSidecar = Command.sidecar("bin/ffmpeg", [
      "-y",
      "-f",
      "f32le",
      "-acodec",
      "pcm_f32le",
      "-ac",
      "2",
      "-ar",
      "44100",
      "-i",
      processedPcmFile,
      outputFile,
    ]);

    ffmpegSidecar.on("close", async () => {
      isAudio
        ? await copyTmpMediaToMediaDir(outputFile)
        : await this.exchangeVideoAudioTrack(outputFile);

      setCmdStatus("success");
      setCmdProcessing(false);

      const permissionGranted = await isPermissionGranted();

      if (permissionGranted) {
        sendNotification({
          title: t("successTitle"),
          body: t("successBody"),
        });
      }
    });

    await ffmpegSidecar.spawn();
  }

  /**
   * Converts The file from .pcm and saves it to media directory.
   */
  async postprocessPcmFile(
    setCmdStatus: React.Dispatch<
      React.SetStateAction<"success" | "error" | undefined>
    >,
    setCmdProcessing: (processing: boolean) => void,
  ) {
    const tempFolder = await appLocalDataDir();
    const processedPcmFilePath = await join(tempFolder, "output", "spleeter");
    await this.convertPcmFile(
      processedPcmFilePath,
      setCmdStatus,
      setCmdProcessing,
    );
  }
}
