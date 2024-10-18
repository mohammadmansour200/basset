import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/Dialog";

function OnBoardDialog() {
  const [appVersion, setAppVersion] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(() => {
    return localStorage.getItem("onboard");
  });
  const { t } = useTranslation();

  useEffect(() => {
    async function getAppVersion() {
      setAppVersion(await getVersion());
    }
    getAppVersion();
  }, []);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open === false) {
          localStorage.setItem("onboard", "");
          setIsDialogOpen("");
        }
      }}
      open={isDialogOpen === "" ? false : true}
    >
      <DialogContent className="select-none">
        <DialogHeader className="flex flex-col items-center">
          <img
            draggable={false}
            src="/typography.png"
            className="w-32"
            alt="Basset logo"
          />
          v{appVersion}
        </DialogHeader>
        <hr className="mt-2 h-[2px] border-none bg-border" />
        <p dir="auto">{t("onboard.greetings")}</p>
        <ul className="ms-4 list-disc">
          <li>{t("onboard.goals.simplicity")}</li>
          <li>{t("onboard.goals.speed")}</li>
          <li>{t("onboard.goals.privacy")}</li>
        </ul>
        <p>
          <br />
          {t("onboard.features")}
          <br />
          <br />
          {t("onboard.steps")}
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default OnBoardDialog;
