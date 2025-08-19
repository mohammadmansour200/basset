import { convertFileSrc } from "@tauri-apps/api/core";
import { extNameSync, fileTitleSync, formatFileSize } from "@/utils/fsUtils";

import { useTranslation } from "react-i18next";
import { MediaType } from "@/stores/useFileStore";
import { useFileStore } from "@/stores/useFileStore";

function MediaInfoSidebar() {
  const { filePath, previewImage, mediaType, size } = useFileStore();
  const { t } = useTranslation();

  return (
    <aside className="fixed mt-12 h-full w-64 border-e border-border p-4">
      <div className="flex flex-col items-center">
        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-md bg-muted">
          {previewImage ? (
            <img
              src={convertFileSrc(previewImage)}
              alt={t("operations.previewImage")}
              className="h-full w-full object-cover"
            />
          ) : mediaType === MediaType.AUDIO ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 fill-foreground"
              viewBox="0 -960 960 960"
            >
              <title>{t("operations.previewImage")}</title>
              <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-382q0-17 11.5-28.5T520-840h160q17 0 28.5 11.5T720-800v80q0 17-11.5 28.5T680-680H560v400q0 66-47 113t-113 47Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              className="h-16 w-16 fill-foreground"
            >
              <title>{t("operations.previewImage")}</title>
              <path d="m160-800 65 130q7 14 20 22t28 8q30 0 46-25.5t2-52.5l-41-82h80l65 130q7 14 20 22t28 8q30 0 46-25.5t2-52.5l-41-82h80l65 130q7 14 20 22t28 8q30 0 46-25.5t2-52.5l-41-82h120q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800Z" />
            </svg>
          )}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold">{fileTitleSync(filePath)}</h2>
          <p className="text-md text-foreground/70">
            {extNameSync(filePath)} | {formatFileSize(size)}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default MediaInfoSidebar;
