import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";

interface IAudioQualitySelectProps {
  setAudioQuality: React.Dispatch<React.SetStateAction<string>>;
}

function AudioQualitySelect({ setAudioQuality }: IAudioQualitySelectProps) {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex w-[250px] items-center gap-2" dir={i18n.dir()}>
      <p className="whitespace-nowrap">{t("audioQualitySelect.selectLabel")}</p>
      <Select
        defaultValue="128k"
        onValueChange={(value) => setAudioQuality(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="320k">{t("audioQualitySelect.high")}</SelectItem>
          <SelectItem value="128k">{t("audioQualitySelect.medium")}</SelectItem>
          <SelectItem value="64k">{t("audioQualitySelect.low")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default AudioQualitySelect;
