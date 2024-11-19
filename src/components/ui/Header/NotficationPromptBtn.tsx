import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { LucideBellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function NotficationPromptBtn() {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const { t } = useTranslation();

  useEffect(() => {
    async function checkPermissionState() {
      const permissionStatus = await isPermissionGranted();
      setPermissionGranted(permissionStatus);
    }
    checkPermissionState();
  }, []);

  async function onNotificationBtnClick() {
    await requestPermission();
  }

  return (
    <div className="flex items-center">
      <div className="flex flex-grow items-center gap-1">
        <LucideBellRing size={22} />
        {t("header.notificationLabel")}
      </div>
      <button
        onClick={onNotificationBtnClick}
        className="rounded-md bg-foreground px-4 py-1 font-medium text-background"
      >
        {permissionGranted
          ? t("header.notificationOn")
          : t("header.notificationOff")}
      </button>
    </div>
  );
}

export default NotficationPromptBtn;
