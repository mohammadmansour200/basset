import { open } from "@tauri-apps/api/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { FolderDownIcon } from "lucide-react";

function OutputPath() {
  const [customPath, setCustomPath] = useState<string | null>(
    () => localStorage.getItem("customPath") || null,
  );

  const { t, i18n } = useTranslation();
  return (
    <div className="flex items-center gap-1">
      <FolderDownIcon size={25} />
      <Select
        value={customPath === null ? "default" : "custom"}
        onValueChange={async (value) => {
          if (value === "custom") {
            const selectedDir = await open({
              directory: true,
            });

            setCustomPath(selectedDir as string | null);
            if (typeof selectedDir === "string") {
              localStorage.setItem("customPath", selectedDir);
            }
          } else {
            setCustomPath(null);
            localStorage.removeItem("customPath");
          }
        }}
        dir={i18n.dir()}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">
            {t("header.defaultDir")} (Downloads)
          </SelectItem>
          <SelectItem value="custom">
            <button>{t("header.customDir")}</button>
            {customPath === null ? "" : `(...${customPath.slice(2)})`}
          </SelectItem>
          {customPath !== null && (
            <div className="text-center">
              <button
                className="text-blue-500 no-underline hover:underline"
                onClick={async () => {
                  const selectedDir = await open({
                    directory: true,
                  });

                  setCustomPath(selectedDir as string | null);
                  if (typeof selectedDir === "string") {
                    localStorage.setItem("customPath", selectedDir);
                  }
                }}
              >
                ...{customPath.slice(2)}
              </button>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default OutputPath;
