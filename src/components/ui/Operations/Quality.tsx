import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFileStore } from "@/stores/useFileStore";
import { MediaType, useOperationStore } from "@/stores/useOperationStore";

import ExecuteBtn from "@/components/ui/ExecuteBtn";
import QualitySelect from "@/components/ui/QualitySelect";
import { Alert, AlertDescription, AlertTitle } from "../Alert";

function Quality() {
  const { mediaType } = useOperationStore();

  const [quality, setQuality] = useState(
    mediaType === MediaType.VIDEO
      ? "1280:720"
      : mediaType === MediaType.AUDIO
        ? "128k"
        : "60",
  );
  const { t, i18n } = useTranslation();
  const { filePath } = useFileStore();

  return (
    <div className="flex flex-col items-center gap-2">
      <Alert dir={i18n.dir()} className="flex flex-row gap-1">
        <img
          draggable={false}
          src="/star.png"
          width="38"
          height="38"
          className="object-contain"
        />
        <div className="max-w-[400px]">
          <AlertTitle>{t("qualitySelect.explanationTitle")}</AlertTitle>
          <AlertDescription>{t("qualitySelect.explanation")}</AlertDescription>
        </div>
      </Alert>
      <QualitySelect setQuality={setQuality} quality={quality} />
      <ExecuteBtn
        text={t("operations.startBtn")}
        command={
          mediaType === MediaType.AUDIO
            ? ["-i", `${filePath}`, "-b:a", `${quality}`]
            : mediaType === MediaType.VIDEO
              ? ["-i", `${filePath}`, "-vf", `scale=${quality}`]
              : [quality]
        }
        isImage={mediaType === MediaType.IMAGE}
      />
    </div>
  );
}

export default Quality;
