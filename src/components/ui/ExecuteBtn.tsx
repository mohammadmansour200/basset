import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import {
  appLocalDataDir,
  audioDir,
  extname,
  join,
  videoDir,
  basename,
} from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-shell";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import { ensureDir, getIsAudio } from "@/utils/fsUtils";

import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import useFFmpeg from "@/hooks/useFFmpeg";
import useSpleeter from "@/hooks/useSpleeter";
import { useFileStore } from "@/stores/useFileStore";
import { useOperationStore } from "@/stores/useOperationStore";

interface ExecuteBtnProps {
  command?: string[];
  isSpleeter?: boolean;
  text?: string;
  outputFormat?: string;
  customFunction?: () => Promise<void> | null;
  disabled?: boolean;
}

function ExecuteBtn({
  command,
  isSpleeter = false,
  text,
  outputFormat,
  customFunction,
  disabled = false,
}: ExecuteBtnProps) {
  const {
    runFFmpeg,
    killFFmpeg,
    cmdStatus: cmdStatusFFmpeg,
    progress: progressFFmpeg,
    errInfo: errInfoFFmpeg,
  } = useFFmpeg();
  const {
    runSpleeter,
    killSpleeter,
    cmdStatus: cmdStatusSpleeter,
    progress: progressSpleeter,
    errInfo: errInfoSpleeter,
  } = useSpleeter();

  const cmdStatus = isSpleeter ? cmdStatusSpleeter : cmdStatusFFmpeg;
  const progress = isSpleeter ? progressSpleeter : progressFFmpeg;
  const errInfo = isSpleeter ? errInfoSpleeter : errInfoFFmpeg;
  const killProcess = isSpleeter ? killSpleeter : killFFmpeg;

  const [outputPath, setOutputPath] = useState("");

  const { t } = useTranslation();

  const { filePath } = useFileStore();
  const { cmdProcessing } = useOperationStore();

  async function onStartBtnClick() {
    await ensureDir("inputTxtFiles");
    await ensureDir("output");

    if (customFunction) await customFunction();

    const fileExt = await extname(filePath);
    const fileName = (await basename(filePath)).replace(`.${fileExt}`, "");

    const date = new Date();
    const outputFileDate = `${date.getFullYear()}_${Math.random().toString().slice(2, 7)}_${date.getMonth()}`;

    const outputFileFormat =
      outputFormat === undefined ? fileExt : outputFormat;

    const outputFilePath = await join(
      await appLocalDataDir(),
      "output",
      `${fileName}_${outputFileDate}.${outputFileFormat}`,
    );
    const isAudio = getIsAudio(outputFilePath);
    const finalPath = await join(
      isAudio ? await audioDir() : await videoDir(),
      `${fileName}_${outputFileDate}.${outputFileFormat}`,
    );

    setOutputPath(finalPath);
    isSpleeter
      ? runSpleeter(`${fileName}_${outputFileDate}.${outputFileFormat}`)
      : runFFmpeg(command as string[], outputFilePath);
  }

  useEffect(() => {
    async function ffmpegErr() {
      if (errInfo !== "" && cmdStatus === "error") {
        const permissionGranted = await isPermissionGranted();
        if (permissionGranted) {
          sendNotification({
            title: t("errTitle"),
            body: errInfo,
          });
        }
      }
    }
    ffmpegErr();
  }, [errInfo, t, cmdStatus]);

  async function openOutputPath() {
    await open(outputPath);
  }

  return (
    <div className="flex w-[250px] flex-col items-center justify-center">
      {/* show success indicator on command success */}
      {cmdStatus === "success" && outputPath && (
        <div className="mb-2 flex gap-1 whitespace-nowrap" dir="auto">
          <CheckCircle2 color="green" />
          <p>
            <span>{t("executeBtn.outputFile")} </span>
            <span
              onClick={openOutputPath}
              className="cursor-pointer text-blue-500 no-underline hover:underline"
            >
              {outputPath.slice(0, 20)}...
            </span>
          </p>
        </div>
      )}

      {/* show error indicator on command error */}
      {cmdStatus === "error" && errInfo !== "" && (
        <div className="mb-2 flex gap-1" dir="auto">
          <TriangleAlert color="red" />
          <p>{errInfo}</p>
        </div>
      )}

      <div
        dir="ltr"
        className={`flex justify-center ${cmdProcessing ? "h-6 w-[500px]" : "h-8 w-full"} gap-1 transition-all duration-300`}
      >
        {/* Progress rate */}
        {cmdProcessing && <p>{Math.trunc(progress)}%</p>}

        {/* Command execute button/progress bar */}
        <button
          style={{ backgroundSize: `${progress}% 100%` }}
          onClick={onStartBtnClick}
          disabled={outputFormat === "" ? true : false || disabled}
          className={`flex w-full items-center justify-center rounded-md font-semibold text-background ${cmdProcessing ? "cursor-wait appearance-none bg-gradient-to-r from-foreground to-foreground bg-[length:0%_100%] bg-no-repeat" : "bg-foreground"} cursor-pointer border border-border transition-all duration-300 disabled:cursor-not-allowed`}
        >
          {!cmdProcessing && <p>{text}</p>}
        </button>

        {/* Kill command button */}
        {cmdProcessing && (
          <button
            className="flex items-center rounded-md bg-muted px-1 py-2"
            onClick={async () => {
              await killProcess();
              setOutputPath("");
            }}
          >
            <X size={20} className="color-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ExecuteBtn;
