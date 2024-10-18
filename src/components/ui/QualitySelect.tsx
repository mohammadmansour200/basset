import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface QualitySelectProps {
  setQuality: React.Dispatch<React.SetStateAction<string>>;
}

function QualitySelect({ setQuality }: QualitySelectProps) {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex w-[250px] items-center gap-2" dir={i18n.dir()}>
      <p className="whitespace-nowrap">{t("tabs.qualityTab")}</p>
      <Select
        defaultValue="1280:720"
        onValueChange={(value) => setQuality(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1920:1080">1080p</SelectItem>
          <SelectItem value="1280:720">720p</SelectItem>
          <SelectItem value="640:480">480p</SelectItem>
          <SelectItem value="640:360">360p</SelectItem>
          <SelectItem value="320:240">240p</SelectItem>
          <SelectItem value="256:144">144p</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default QualitySelect;
