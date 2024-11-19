import { useTranslation } from "react-i18next";

import ExecuteBtn from "@/components/ui/ExecuteBtn";

function RemoveMusic() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2">
      <ExecuteBtn isSpleeter text={t("tabs.convertBtn")} />
    </div>
  );
}

export default RemoveMusic;
