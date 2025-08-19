import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFileStore } from "@/stores/useFileStore";

import CompressSlider from "@/components/ui/CompressSlider";
import ExecuteBtn from "@/components/ui/ExecuteBtn";

function Compress() {
  const [compressRate, setCompressRate] = useState(8);
  const { filePath } = useFileStore();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2">
      <CompressSlider
        compressRate={compressRate}
        setCompressRate={setCompressRate}
      />
      <ExecuteBtn
        text={t("operations.startBtn")}
        command={["-i", `${filePath}`, "-crf", `${compressRate + 20}`]}
      />
    </div>
  );
}

export default Compress;
