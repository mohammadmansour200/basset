import { useTranslation } from "react-i18next";
import { MediaType, useOperationStore } from "@/stores/useOperationStore";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface QualitySelectProps {
  setQuality: React.Dispatch<React.SetStateAction<string>>;
  quality: string;
}

function QualitySelect({ quality, setQuality }: QualitySelectProps) {
  const { i18n, t } = useTranslation();
  const { mediaType } = useOperationStore();
  return (
    <div className="flex w-[250px] items-center gap-2" dir={i18n.dir()}>
      <p className="whitespace-nowrap">{t("qualitySelect.selectLabel")}</p>
      <Select
        defaultValue={quality}
        onValueChange={(value) => setQuality(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {mediaType === MediaType.VIDEO && (
            <>
              <SelectItem value="1920:1080">1080p</SelectItem>
              <SelectItem value="1280:720">720p</SelectItem>
              <SelectItem value="640:480">480p</SelectItem>
              <SelectItem value="640:360">360p</SelectItem>
              <SelectItem value="320:240">240p</SelectItem>
              <SelectItem value="256:144">144p</SelectItem>
            </>
          )}
          {mediaType === MediaType.AUDIO && (
            <>
              <SelectItem value="320k">{t("qualitySelect.high")}</SelectItem>
              <SelectItem value="128k">{t("qualitySelect.medium")}</SelectItem>
              <SelectItem value="64k">{t("qualitySelect.low")}</SelectItem>
            </>
          )}
          {mediaType === MediaType.IMAGE && (
            <>
              <SelectItem value="90">{t("qualitySelect.high")}</SelectItem>
              <SelectItem value="60">{t("qualitySelect.medium")}</SelectItem>
              <SelectItem value="30">{t("qualitySelect.low")}</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default QualitySelect;
