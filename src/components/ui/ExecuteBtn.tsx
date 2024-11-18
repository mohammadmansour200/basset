import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import {
  tempDir,
  audioDir,
  basename,
  extname,
  join,
  videoDir,
} from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-shell";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import { killFFmpeg, runFFmpeg } from "@/utils/ffmpeg";
import { ensureDir, getIsAudio } from "@/utils/fsUtils";

import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import { useFile } from "@/contexts/FileProvider";

interface ExecuteBtnProps {
  command: string[];
  text?: string;
  outputFormat?: string;
  setCmdProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  customFunction?: () => Promise<void> | null;
  disabled?: boolean;
}

function ExecuteBtn({
  command,
  text,
  outputFormat,
  setCmdProcessing,
  customFunction,
  disabled = false,
}: ExecuteBtnProps) {
  const [cmdStatus, setCmdStatus] = useState<"success" | "error">();
  const [errInfo, setErrInfo] = useState("");
  const [progress, setProgress] = useState(0);

  const [cmdRunning, setCmdRunning] = useState(
    () => cmdStatus !== undefined || false,
  );
  const [outputPath, setOutputPath] = useState("");

  const { t } = useTranslation();

  const { filePath } = useFile();

  useEffect(() => {
    if (cmdStatus !== undefined) setCmdRunning(false);
  }, [cmdStatus]);

  async function onStartBtnClick() {
    if (outputFormat === "") return;
    await ensureDir("inputTxtFiles");
    await ensureDir("output");

    if (customFunction) await customFunction();

    setCmdProcessing(true);
    setCmdRunning(true);
    setCmdStatus(undefined);
    setProgress(0);

    const fileExt = await extname(filePath);
    const fileName = (await basename(filePath, fileExt)).replace(".", "");
    const date = new Date();
    const outputFileDate = `${date.getFullYear()}_${Math.random().toString().slice(2, 7)}_${date.getMonth()}`;

    const outputFileFormat =
      outputFormat === undefined ? fileExt : outputFormat;

    const outputFilePath = await join(
      await tempDir(),
      "output",
      `${fileName}_${outputFileDate}.${outputFileFormat}`,
    );
    const isAudio = getIsAudio(outputFilePath);
    const finalPath = await join(
      isAudio ? await audioDir() : await videoDir(),
      `${fileName}_${outputFileDate}.${outputFileFormat}`,
    );

    setOutputPath(finalPath);

    runFFmpeg(
      command,
      setCmdStatus,
      setProgress,
      setErrInfo,
      setCmdProcessing,
      filePath,
      outputFilePath,
    );
  }

  useEffect(() => {
    async function ffmpegErr() {
      if (errInfo !== "" && cmdStatus === "error") {
        setCmdProcessing(false);
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
  }, [errInfo, t, cmdStatus, setCmdProcessing]);

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
              {outputPath}...
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
        className={`flex justify-center ${cmdRunning ? "h-6 w-[500px]" : "h-8 w-full"} gap-1 transition-all duration-300`}
      >
        {/* Progress rate */}
        {cmdRunning && <p>{Math.trunc(progress)}%</p>}

        {/* Command execute button/progress bar */}
        <button
          style={{ backgroundSize: `${progress}% 100%` }}
          onClick={onStartBtnClick}
          disabled={outputFormat === "" ? true : false || disabled}
          className={`flex w-full items-center justify-center rounded-md font-semibold text-background ${cmdRunning ? "cursor-wait appearance-none bg-gradient-to-r from-foreground to-foreground bg-[length:0%_100%] bg-no-repeat" : "bg-foreground"} cursor-pointer border border-border transition-all duration-300 disabled:cursor-not-allowed`}
        >
          {!cmdRunning && <p>{text}</p>}
        </button>

        {/* Kill command button */}
        {cmdRunning && (
          <button
            className="flex items-center rounded-md bg-muted px-1 py-2"
            onClick={async () => {
              setCmdProcessing(false);
              setCmdRunning(false);
              setCmdStatus(undefined);
              setProgress(0);
              setErrInfo("");
              await killFFmpeg();
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
