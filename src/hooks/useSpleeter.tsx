import { useState } from "react";

import { join, tempDir } from "@tauri-apps/api/path";
import { remove } from "@tauri-apps/plugin-fs";
import { Child, Command } from "@tauri-apps/plugin-shell";

import { deleteMediaTemp, ensureDir } from "@/utils/fsUtils";
import { SpleeterHelper } from "@/utils/SpleeterHelper";

import { useFile } from "@/contexts/FileProvider";
import { useTranslation } from "react-i18next";

function useSpleeter() {
  const { t } = useTranslation();
  const [cmdStatus, setCmdStatus] = useState<"success" | "error">();
  const [errInfo, setErrInfo] = useState("");
  const [progress, setProgress] = useState(0);

  const { setCmdProcessing, filePath, duration } = useFile();

  const [spleeter, setSpleeter] = useState<Child>();

  async function runSpleeter(outputName: string) {
    setCmdStatus(undefined);
    setProgress(0);
    setCmdProcessing(true);

    const ensureSpleeterFolderPath = await join("output", "spleeter");
    await ensureDir(ensureSpleeterFolderPath);

    const spleeterHelper = new SpleeterHelper(filePath, outputName);
    const preprocessedInputFilePath = await spleeterHelper.preprocessFile();

    const tempfolder = await tempDir();
    const outputPcmFilePath = await join(
      tempfolder,
      "output",
      "spleeter",
      "processed",
    );

    const spleeterSidecar = Command.sidecar("bin/SpleeterExe", [
      preprocessedInputFilePath,
      outputPcmFilePath,
      duration.toString(),
      "20",
    ]);

    spleeterSidecar.on("close", async () => {
      await remove(preprocessedInputFilePath);
      await spleeterHelper.postprocessPcmFile(setCmdStatus, setCmdProcessing);
    });

    spleeterSidecar.on("error", (error) => {
      setCmdStatus("error");
      setCmdProcessing(false);
      console.log(error);
    });

    spleeterSidecar.stdout.on("data", (data) => {
      const match = data.match(/Progress:\s([\d.]+)%/);

      if (!match) return;

      const progress = parseFloat(match[1]);

      setProgress(progress);

      const inputErrRegex = /Error opening input/;
      const somethingWentWrongRegex = /Conversion failed/;
      const outputErrRegex = /Error opening output/;
      const streamErrRegex = /Output file does not contain any stream/;
      if (data.match(inputErrRegex)) setErrInfo(t("inputErr"));

      if (data.match(outputErrRegex)) setErrInfo(t("outputErr"));

      if (data.match(somethingWentWrongRegex))
        setErrInfo(t("somethingWentWrongErr"));

      if (data.match(streamErrRegex) || data.match(outputErrRegex))
        setErrInfo(t("streamErr"));
    });

    const spleeterChild = await spleeterSidecar.spawn();
    setSpleeter(spleeterChild);
  }

  async function killSpleeter() {
    try {
      setCmdProcessing(false);
      setCmdStatus(undefined);
      setProgress(0);
      setErrInfo("");
      if (spleeter) {
        await spleeter.kill();
        await deleteMediaTemp();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return { killSpleeter, runSpleeter, cmdStatus, progress, errInfo };
}

export default useSpleeter;
