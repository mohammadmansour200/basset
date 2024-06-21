import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";

interface IFormatSelectProps {
  setFormat: React.Dispatch<React.SetStateAction<string>>;
  isAudio?: boolean | null;
}

function FormatSelect({ setFormat, isAudio = false }: IFormatSelectProps) {
  const { i18n, t } = useTranslation();
  return (
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
          </SelectContent>
        ) : (
          <SelectContent>
            <SelectItem value="mp4">mp4</SelectItem>
            <SelectItem value="webm">webm</SelectItem>
            <SelectItem value="avi">avi</SelectItem>
            <SelectItem value="mov">mov</SelectItem>
            <SelectItem value="mkv">mkv</SelectItem>
            <SelectItem value="wmv">wmv</SelectItem>
            <SelectItem value="flv">flv</SelectItem>
          </SelectContent>
        )}
      </Select>
    </div>
  );
}

export default FormatSelect;
