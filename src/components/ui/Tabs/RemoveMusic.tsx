import { useTranslation } from "react-i18next";

import ExecuteBtn from "@/components/ui/ExecuteBtn";
import { Alert, AlertDescription, AlertTitle } from "../Alert";

function RemoveMusic() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2">
      <Alert className="flex flex-row gap-1">
        <img
          draggable={false}
          src="/pin.png"
          width="38"
          height="38"
          className="object-contain"
        />
        <div className="max-w-[400px]">
          <AlertTitle>{t("removeMusic.noticeTitle")}:</AlertTitle>
          <AlertDescription>
            <ul className="list-inside list-disc">
              <li>{t("removeMusic.notice1")}</li>
              <li>{t("removeMusic.notice2")}</li>
              <li>{t("removeMusic.notice3")}</li>
            </ul>
          </AlertDescription>
        </div>
      </Alert>
      <ExecuteBtn isSpleeter text={t("tabs.spleeterBtn")} />
    </div>
  );
}

export default RemoveMusic;
