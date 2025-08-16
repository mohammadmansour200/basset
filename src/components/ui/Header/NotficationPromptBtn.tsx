import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { LucideBellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "../Switch";

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

  async function onRequestNotificationPermission() {
    await requestPermission().then(
      (data) => data === "granted" && setPermissionGranted(true),
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex flex-grow items-center gap-1">
        <LucideBellRing size={22} />
        {t("header.notificationLabel")}
      </div>
      <Switch
        dir="ltr"
        checked={permissionGranted === true}
        onCheckedChange={onRequestNotificationPermission}
      />
    </div>
  );
}

export default NotficationPromptBtn;
