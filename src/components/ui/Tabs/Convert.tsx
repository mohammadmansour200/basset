import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getIsAudio } from "@/utils/fsUtils";
import { useFile } from "@/contexts/FileProvider";

import ExecuteBtn from "@/components/ui/ExecuteBtn";
import FormatSelect from "@/components/ui/FormatSelect";

function Convert() {
  const [outputFormat, setOutputFormat] = useState("");
  const { t } = useTranslation();
  const { filePath } = useFile();

  const isAudio = getIsAudio(filePath);
  return (
    <div className="flex flex-col items-center gap-2">
      <FormatSelect isAudio={isAudio} setFormat={setOutputFormat} />
      <ExecuteBtn
        text={t("tabs.convertBtn")}
        outputFormat={outputFormat}
        command={
          outputFormat === "wav"
            ? ["-i", `${filePath}`, "-ar", "16000"]
            : ["-i", `${filePath}`]
        }
      />
    </div>
  );
}

export default Convert;
