import { useState } from "react";
import { useTranslation } from "react-i18next";

import CompressSlider from "@/components/ui/CompressSlider";
import ExecuteBtn from "@/components/ui/ExecuteBtn";
import { useFile } from "@/contexts/FileProvider";

function Compress() {
  const [compressRate, setCompressRate] = useState(8);
  const { filePath } = useFile();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2">
      <CompressSlider
        compressRate={compressRate}
        setCompressRate={setCompressRate}
      />
      <ExecuteBtn
        text={t("tabs.startBtn")}
        command={["-i", `${filePath}`, "-crf", `${compressRate + 20}`]}
      />
    </div>
  );
}

export default Compress;