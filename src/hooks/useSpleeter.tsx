import { useState } from "react";

import { join, appLocalDataDir } from "@tauri-apps/api/path";
import { remove } from "@tauri-apps/plugin-fs";
import { Command } from "@tauri-apps/plugin-shell";

import { deleteMediaTemp, ensureDir } from "@/utils/fsUtils";
import { SpleeterHelper } from "@/utils/SpleeterHelper";

import { getMediaDuration } from "@/utils/ffmpegHelperUtils";
import { useFileStore } from "@/stores/useFileStore";
import { useOperationStore } from "@/stores/useOperationStore";

function useSpleeter() {
  const [cmdStatus, setCmdStatus] = useState<"success" | "error" | null>(null);
  const [errInfo, setErrInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { filePath } = useFileStore();
  const { setCmdProcessing, setLogs, process, setProcess } =
    useOperationStore();

  async function runSpleeter(outputName: string) {
    setLogs([]);
    setCmdStatus(null);
    setProgress(0);
    setCmdProcessing(true);

    const ensureSpleeterFolderPath = await join("output", "spleeter");
    await ensureDir(ensureSpleeterFolderPath);

    const spleeterHelper = new SpleeterHelper(
      filePath,
      outputName,
      (logs) => setLogs(logs),
      (error) => {
        setErrInfo(error);
        setCmdStatus("error");
        setCmdProcessing(false);
      },
    );
    const preprocessedInputFilePath = await spleeterHelper.preprocessFile();

    const tempfolder = await appLocalDataDir();
    const outputPcmFilePath = await join(
      tempfolder,
      "output",
      "spleeter",
      "processed",
    );

    const duration = await getMediaDuration(filePath);

    setLogs(`File duration: ${duration}`);

    const spleeterSidecar = Command.sidecar("bin/SpleeterExe", [
      preprocessedInputFilePath,
      outputPcmFilePath,
      duration.toString(),
      "20",
    ]);

    spleeterSidecar.on("close", async ({ code }) => {
      if (code === 0) {
        await remove(preprocessedInputFilePath);
        await spleeterHelper.postprocessPcmFile(
          (status) => setCmdStatus(status),
          (processing) => setCmdProcessing(processing),
        );
      }
      if (code === 1) {
        await process?.kill();
        setCmdStatus("error");
        setCmdProcessing(false);
      }
    });

    spleeterSidecar.on("error", (error) => {
      setLogs(error);

      setCmdStatus("error");
      setCmdProcessing(false);
      console.log(error);
    });

    spleeterSidecar.stdout.on("data", (data) => {
      setLogs(data);

      const match = data.match(/Progress:\s([\d.]+)%/);

      if (!match) return;

      const progress = parseFloat(match[1]);

      setProgress(progress);
    });

    spleeterSidecar.stderr.on("data", async (data) => {
      setLogs(data);

      const errorPatterns = [
        {
          regex: /Processing failed/i,
          key: "inputFileErr",
        },
        {
          regex: /Failed to open chunk/i,
          key: "inputFileErr",
        },
        {
          regex: /Failed to open chunk/i,
          key: "inputFileErr",
        },
        {
          regex: /output file/i,
          key: "outputFileErr",
        },
      ];

      const matchedError = errorPatterns.find((pattern) =>
        data.match(pattern.regex),
      );

      if (matchedError) {
        setErrInfo(matchedError.key);
      }
    });

    const spleeterChild = await spleeterSidecar.spawn();
    setProcess(spleeterChild);
  }

  async function killSpleeter() {
    try {
      setCmdProcessing(false);
      setCmdStatus(null);
      setProgress(0);
      setErrInfo("");
      if (process) {
        await process.kill();
        await deleteMediaTemp();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return { killSpleeter, runSpleeter, cmdStatus, progress, errInfo };
}

export default useSpleeter;
