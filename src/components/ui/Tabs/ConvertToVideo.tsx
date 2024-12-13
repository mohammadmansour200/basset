import { useState } from "react";
import { useTranslation } from "react-i18next";

import ExecuteBtn from "@/components/ui/ExecuteBtn";
import ImageFileUploader from "@/components/ui/ImageFileUploader";
import { useFileStore } from "@/stores/useFileStore";

function ConvertToVideo() {
  const [imageFilePath, setImageFilePath] = useState("");
  const { t } = useTranslation();
  const { filePath } = useFileStore();
  return (
    <div className="flex flex-col items-center gap-2">
      <ImageFileUploader
        setImageFilePath={setImageFilePath}
        imageFilePath={imageFilePath}
      />
      <ExecuteBtn
        disabled={imageFilePath === "" ? true : false}
        text={t("tabs.convertBtn")}
        outputFormat="mp4"
        command={[
          "-r",
          "1",
          "-loop",
          "1",
          "-i",
          `${imageFilePath}`,
          "-i",
          `${filePath}`,
          "-acodec",
          "copy",
          "-r",
          "1",
          "-pix_fmt",
          "yuv420p",
          "-tune",
          "stillimage",
          "-shortest",
        ]}
      />
    </div>
  );
}

export default ConvertToVideo;
