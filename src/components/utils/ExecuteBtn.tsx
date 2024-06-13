import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/api/notification";
import { basename, downloadDir, extname } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/api/shell";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import { killCommand, runCommand } from "@/utils/ffmpeg";

import { CheckCircle2, TriangleAlert, X } from "lucide-react";

interface IExecuteBtnProps {
  command: string | string[];
  text?: string;
  inputFilePath: string;
  outputFormat?: string;
  setCmdProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  cmdCustom?: boolean;
  customFunc?: () => Promise<void> | null;
  disabled?: boolean;
}

function ExecuteBtn({
  command,
  text,
  inputFilePath,
  outputFormat,
  setCmdProcessing,
  cmdCustom = false,
  customFunc,
  disabled = false,
}: IExecuteBtnProps) {
  const [cmdStatus, setCmdStatus] = useState<"success" | "error">();
  const [errInfo, setErrInfo] = useState("");
  const [progress, setProgress] = useState(0);

  const [cmdRunning, setCmdRunning] = useState(
    () => cmdStatus !== undefined || false,
  );
  const [outputPath, setOutputPath] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    if (cmdStatus !== undefined) setCmdRunning(false);
  }, [cmdStatus]);

  async function onStartBtnClick() {
    if (outputFormat === "") return;

    if (customFunc) {
      await customFunc();
    }

    setCmdProcessing(true);
    setCmdRunning(true);
    setCmdStatus(undefined);
    setProgress(0);
    const fileExt = await extname(inputFilePath);
    const fileName = (await basename(inputFilePath, fileExt)).replace(".", "");
    const date = new Date();
    const outputFileDate = `${date.getFullYear()}_${Math.random().toString().slice(2, 7)}_${date.getMonth()}`;

    const outputFileFormat =
      outputFormat === undefined ? fileExt : outputFormat;

    let outputPath;
    const customPath = localStorage.getItem("customPath");
    if (customPath === null) {
      const path = await downloadDir();
      setOutputPath(path);
      outputPath = path;
    } else {
      outputPath = customPath;
      setOutputPath(customPath);
    }

    let cmd: string[];

    const outputFilePath = `${outputPath}${customPath === null ? "" : "/"}${fileName}_${outputFileDate}.${outputFileFormat}`;

    if (command === "") {
      cmd = ["-i", `${inputFilePath}`];
    } else if (cmdCustom) {
      cmd = [...command];
    } else {
      cmd = ["-i", `${inputFilePath}`, ...(command as string).split(" ")];
    }

    runCommand(
      cmd,
      setCmdStatus,
      setProgress,
      setErrInfo,
      inputFilePath,
      outputFilePath,
    );
  }

  useEffect(() => {
    async function ffmpegSuccess() {
      if (cmdStatus === "success") {
        setCmdProcessing(false);
      }
    }
    ffmpegSuccess();
  }, [cmdStatus, setCmdProcessing]);

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
      {cmdStatus === "success" && (
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
            onClick={() => {
              killCommand();
              setCmdProcessing(false);
              setCmdRunning(false);
              setCmdStatus(undefined);
              setProgress(0);
              setErrInfo("");
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
