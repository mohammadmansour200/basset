import { invoke } from "@tauri-apps/api/core";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOperationStore } from "@/stores/useOperationStore";

function useImage() {
  const { t } = useTranslation();
  const [cmdStatus, setCmdStatus] = useState<"success" | "error" | null>(null);
  const [errInfo, setErrInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { setCmdProcessing, setLogs } = useOperationStore();

  async function compressImage(
    inputPath: string,
    outputPath: string,
    quality: string,
  ) {
    setLogs([]);
    setCmdStatus(null);
    setErrInfo(null);
    setProgress(0);
    setCmdProcessing(true);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress < 90) {
        setProgress(currentProgress);
      }
    }, 6000);

    invoke("compress_image", {
      inputPath: inputPath,
      outputPath: outputPath,
      quality: quality,
    })
      .then(async () => {
        clearInterval(progressInterval);
        setProgress(100);
        setCmdStatus("success");
        const permissionGranted = await isPermissionGranted();

        if (permissionGranted) {
          sendNotification({
            title: t("successTitle"),
            body: t("successBody"),
          });
        }
        setCmdProcessing(false);
      })
      .catch((e) => {
        setLogs(e);
        clearInterval(progressInterval);
        setErrInfo(e);
        setCmdStatus("error");
        setCmdProcessing(false);
      });
  }

  return { compressImage, cmdStatus, progress, errInfo };
}

export default useImage;
