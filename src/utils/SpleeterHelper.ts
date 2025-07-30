import { join, appLocalDataDir } from "@tauri-apps/api/path";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import { copyTmpMediaToMediaDir, extNameSync } from "./fsUtils";

import { t } from "i18next";
import { ffmpeg } from "./command";

export class SpleeterHelper {
  private filepath: string;
  private finalOutputName: string;
  private onLogs: (logs: string[] | string) => void;
  private onError: (error: string) => void;

  constructor(
    filepath: string,
    finalOutputName: string,
    onLogs: (logs: string[] | string) => void,
    onError: (error: string) => void,
  ) {
    this.filepath = filepath;
    this.finalOutputName = finalOutputName;
    this.onLogs = onLogs;
    this.onError = onError;
  }

  private parseFFmpegError(data: string) {
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
      this.onError(matchedError.key);
    }
  }

  /**
   * Preprocesses the file and converts it to .pcm format.
   *
   * This is crucial, because spleeter only understands .pcm format.
   *
   * @returns Preprocessed .pcm file path
   */
  async preprocessFile(): Promise<string> {
    const tempFolder = await appLocalDataDir();
    const outputFolder = await join(
      tempFolder,
      "output",
      "spleeter",
      "preprocessed.pcm",
    );
    const ffmpegSidecar = ffmpeg([
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

    ffmpegSidecar.stderr.on("data", async (data) => {
      this.onLogs(data);
      this.parseFFmpegError(data);
    });

    return new Promise((resolve) => {
      ffmpegSidecar.on("close", ({ code }) => {
        if (code === 0) {
          resolve(outputFolder);
          this.onLogs("File processed successfully");
        }
      });

      ffmpegSidecar.on("error", (error) =>
        this.onLogs(`Processing error: ${error}`),
      );

      ffmpegSidecar.spawn();
    });
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

    const ffmpegSidecar = ffmpeg([
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

    ffmpegSidecar.stderr.on("data", async (data) => {
      this.onLogs(data);
      this.parseFFmpegError(data);
    });

    ffmpegSidecar.on("close", async () => {
      await copyTmpMediaToMediaDir(finalTmpOutputFile);
    });

    await ffmpegSidecar.spawn();
  }

  /**
   * Converts processed .pcm file to either:
   * - (Suitable audio codec) in case the input file is video
   * - the input's format in case the file is audio
   * @private
   */
  private async convertPcmFile(
    processedPcmFilePath: string,
    onStatusChange: (status: "success" | "error" | null) => void,
    onProcessChange: (processing: boolean) => void,
  ) {
    const processedPcmFile = await join(processedPcmFilePath, "processed.pcm");

    const finalOutputExt = extNameSync(this.finalOutputName);

    const videoAudioCodecExtMap = {
      mp4: "aac",
      webm: "opus",
      "3gp": "mp3",
      flv: "aac",
    };

    // @ts-ignore
    const videoAudioCodecExt = videoAudioCodecExtMap[finalOutputExt];

    const isAudio = videoAudioCodecExt ? false : true;

    const outputFile = await join(
      processedPcmFilePath,
      `${this.finalOutputName.replace(`.${extNameSync(this.finalOutputName)}`, "")}.${isAudio ? extNameSync(this.finalOutputName) : videoAudioCodecExt}`,
    );

    const ffmpegSidecar = ffmpeg([
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

    ffmpegSidecar.stderr.on("data", async (data) => {
      this.onLogs(data);
      this.parseFFmpegError(data);
    });

    ffmpegSidecar.on("close", async () => {
      this.onLogs("File converted successfully");
      isAudio
        ? await copyTmpMediaToMediaDir(outputFile)
        : await this.exchangeVideoAudioTrack(outputFile);

      onStatusChange("success");
      onProcessChange(false);

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
    onStatusChange: (status: "success" | "error" | null) => void,
    onProcessChange: (processing: boolean) => void,
  ) {
    const tempFolder = await appLocalDataDir();
    const processedPcmFilePath = await join(tempFolder, "output", "spleeter");
    await this.convertPcmFile(
      processedPcmFilePath,
      onStatusChange,
      onProcessChange,
    );
  }
}
