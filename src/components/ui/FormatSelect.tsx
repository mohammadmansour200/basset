import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Alert, AlertDescription, AlertTitle } from "./Alert";

interface FormatSelectProps {
  setFormat: React.Dispatch<React.SetStateAction<string>>;
  isAudio?: boolean | null;
}

function FormatSelect({ setFormat, isAudio = false }: FormatSelectProps) {
  const { i18n, t } = useTranslation();
  return (
    <>
      <Alert dir={i18n.dir()} className="flex flex-row gap-1">
        <img
          draggable={false}
          src="/star.png"
          width="38"
          height="38"
          className="object-contain"
        />
        <div className="max-w-[400px]">
          <AlertTitle>{t("formatSelect.explanationTitle")}</AlertTitle>
          <AlertDescription>{t("formatSelect.explanation")}</AlertDescription>
        </div>
      </Alert>
      <div className="flex w-[250px] items-center gap-2" dir={i18n.dir()}>
        <p className="whitespace-nowrap">{t("formatSelect.label")}</p>
        <Select onValueChange={(value) => setFormat(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("formatSelect.placeholder")} />
          </SelectTrigger>
          {isAudio ? (
            <SelectContent>
              <SelectItem value="mp3">
                mp3 {t("formatSelect.recommended")}
              </SelectItem>
              <SelectItem value="aac">aac</SelectItem>
              <SelectItem value="ogg">ogg</SelectItem>
              <SelectItem value="wav">wav</SelectItem>
            </SelectContent>
          ) : (
            <SelectContent>
              <SelectItem value="mp4">mp4</SelectItem>
              <SelectItem value="webm">webm</SelectItem>
              <SelectItem value="mov">mov</SelectItem>
              <SelectItem value="avi">avi</SelectItem>
              <SelectItem value="mkv">mkv</SelectItem>
            </SelectContent>
          )}
        </Select>
      </div>
    </>
  );
}

export default FormatSelect;
