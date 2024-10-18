import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFile } from "@/contexts/FileProvider";

import { getIsAudio } from "@/utils/fsUtils";

import ExecuteBtn from "@/components/ui/ExecuteBtn";
import QualitySelect from "@/components/ui/QualitySelect";
import AudioQualitySelect from "../AudioQualitySelect";
import { Alert, AlertDescription, AlertTitle } from "../Alert";

interface QualityProps {
  setCmdProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

function Quality({ setCmdProcessing }: QualityProps) {
  const [quality, setQuality] = useState("1280:720");
  const [audioQuality, setAudioQuality] = useState("128k");
  const { t } = useTranslation();
  const { filePath } = useFile();

  const isAudio = getIsAudio(filePath);

  return (
    <div className="flex flex-col items-center gap-2">
      <Alert className="flex flex-row gap-1">
        <img
          draggable={false}
          src="src/assets/star.png"
          width="38"
          height="38"
          className="object-contain"
        />
        <div className="max-w-[400px]">
          <AlertTitle>{t("qualitySelect.explanationTitle")}</AlertTitle>
          <AlertDescription>{t("qualitySelect.explanation")}</AlertDescription>
        </div>
      </Alert>
      {isAudio ? (
        <AudioQualitySelect setAudioQuality={setAudioQuality} />
      ) : (
        <QualitySelect setQuality={setQuality} />
      )}
      <ExecuteBtn
        setCmdProcessing={setCmdProcessing}
        text={t("tabs.startBtn")}
        command={
          isAudio
            ? ["-i", `${filePath}`, "-b:a", `${audioQuality}`]
            : ["-i", `${filePath}`, "-vf", `scale=${quality}`]
        }
      />
    </div>
  );
}

export default Quality;
