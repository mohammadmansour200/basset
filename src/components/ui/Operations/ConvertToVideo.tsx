import { useState } from "react";
import { useTranslation } from "react-i18next";

import ExecuteBtn from "@/components/ui/ExecuteBtn";
import ImageFileUploader from "@/components/ui/ImageFileUploader";
import { useFileStore } from "@/stores/useFileStore";
import { toast } from "sonner";

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
        validation={
          imageFilePath === ""
            ? () => {
                toast.error(t("executeBtn.selectImageErr"));
              }
            : undefined
        }
        text={t("tabs.convertBtn")}
        outputFormat="mp4"
        command={[
          "-i",
          `${imageFilePath}`,
          "-i",
          `${filePath}`,
          "-pix_fmt",
          "yuv420p",
          "-tune",
          "stillimage",
          "-vf",
          "scale=1280:720,pad=ceil(iw/2)*2:ceil(ih/2)*2",
        ]}
      />
    </div>
  );
}

export default ConvertToVideo;
