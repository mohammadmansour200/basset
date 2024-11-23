import ExecuteBtn from "@/components/ui/ExecuteBtn";
import FormatSelect from "@/components/ui/FormatSelect";
import { useFileStore } from "@/stores/useFileStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function ConvertToAudio() {
  const [outputFormat, setOutputFormat] = useState("");
  const { t } = useTranslation();
  const { filePath } = useFileStore();
  return (
    <div className="flex flex-col items-center gap-2">
      <FormatSelect isAudio={true} setFormat={setOutputFormat} />
      <ExecuteBtn
        disabled={outputFormat === ""}
        text={t("tabs.convertBtn")}
        outputFormat={outputFormat}
        command={
          outputFormat === "wav"
            ? ["-i", `${filePath}`, "-ar", "16000", "-vn"]
            : ["-i", `${filePath}`, "-vn"]
        }
      />
    </div>
  );
}

export default ConvertToAudio;
