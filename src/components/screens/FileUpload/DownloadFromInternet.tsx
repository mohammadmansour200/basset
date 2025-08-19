import { downloadDir, join } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { stat } from "@tauri-apps/plugin-fs";

import { getIsAudio, getIsImage } from "@/utils/fsUtils";
import {
  extractPreviewImage,
  getMediaDuration,
} from "@/utils/ffmpegHelperUtils";

import { useState } from "react";
import { useFileStore } from "@/stores/useFileStore";
import { useOperationStore } from "@/stores/useOperationStore";
import { MediaType } from "@/stores/useFileStore";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Ripple } from "react-ripple-click";
import { toast } from "sonner";

const supportedDomains = [
  "youtube.com",
  "youtu.be",
  "x.com",
  "twitter.com",
  "instagram.com",
  "facebook.com",
  "linkedin.com",
  "soundcloud.com",
];

const intQualityMap = {
  high: "192",
  medium: "128",
  low: "96",
};

type YtDlpMediaType = "video" | "audio";
type QualityType = "high" | "medium" | "low";

function DownloadFromInternet() {
  const [url, setUrl] = useState("");
  const [mediaType, setMediaType] = useState<YtDlpMediaType>("video");
  const [quality, setQuality] = useState<QualityType>("medium");

  const { t, i18n } = useTranslation();
  const { cmdProcessing, setCmdProcessing } = useOperationStore();
  const {
    setDuration,
    setFilePath,
    setMediaType: setProcessingMediaType,
    setPreviewImage,
    setSize,
  } = useFileStore();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!url) return;

    const isValidUrl = supportedDomains.some((domain) => url.includes(domain));
    if (!isValidUrl) {
      toast.error(t("uploadPage.wrongUrlDownloadErr"));
      return;
    }

    setCmdProcessing(true);

    const downloadPath = await downloadDir();

    const outputTemplate = await join(downloadPath, "%(id)s.%(ext)s");

    const ytDlpCmd = [
      "--update",
      "--no-playlist",
      "-o",
      outputTemplate,
      "-P",
      downloadPath,
      url,
      "--print-json",
    ];

    if (mediaType === "audio")
      ytDlpCmd.push(
        "-f",
        `bestaudio[abr>=${intQualityMap[quality]}]/bestaudio`,
        "-x",
        "--audio-format",
        "mp3",
      );

    if (mediaType === "video" && quality !== "high")
      ytDlpCmd.push(
        "-f",
        quality == "medium"
          ? "bestvideo[height<=720]+bestaudio"
          : "bestvideo[height<=360]+bestaudio",
      );

    const ytDlpSidecar = Command.sidecar("bin/ytDlp", ytDlpCmd);

    let downloadedFilePath: string | null = null;
    let isStdoutProcessed = false;
    ytDlpSidecar.on("close", async ({ code }) => {
      if (code === 0) {
        while (!isStdoutProcessed && downloadedFilePath === null) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        setCmdProcessing(false);

        let determinedMediaType: MediaType | null = null;

        if (downloadedFilePath) {
          if (getIsAudio(downloadedFilePath)) {
            determinedMediaType = MediaType.AUDIO;
          } else if (getIsImage(downloadedFilePath)) {
            determinedMediaType = MediaType.IMAGE;
          } else {
            determinedMediaType = MediaType.VIDEO;
          }

          setProcessingMediaType(determinedMediaType);
          setFilePath(downloadedFilePath!);

          await stat(downloadedFilePath).then((data) => setSize(data.size));

          await extractPreviewImage(
            downloadedFilePath,
            determinedMediaType,
          ).then((data) => setPreviewImage(data));

          await getMediaDuration(downloadedFilePath).then((data) => {
            setDuration(data);
          });
        }
      } else {
        setCmdProcessing(false);
      }
    });

    ytDlpSidecar.on("error", (error) => {
      console.log(error);
      setCmdProcessing(false);
    });

    ytDlpSidecar.stdout.on("data", async (data) => {
      try {
        const urlData = JSON.parse(data);
        const filename = `${urlData["id"]}.${mediaType === "audio" ? "mp3" : urlData["ext"]}`;
        console.log(urlData);
        const path = await join(downloadPath, filename);
        downloadedFilePath = path;
      } finally {
        isStdoutProcessed = true;
      }
    });

    ytDlpSidecar.stderr.on("data", (data) => {
      console.log(data);
      const errorPatterns = [
        {
          regex:
            /not available in your country|geo.?restricted|geographic.?restriction/i,
          key: "geoRestricted",
        },
        {
          regex: /sign in|login required|authentication/i,
          key: "loginRequired",
        },
        {
          regex: /rate.?limit|try again later|too many requests/i,
          key: "rateLimit",
        },
        { regex: /DRM protected|drm protection/i, key: "drmProtected" },
        {
          regex:
            /No video formats found|no formats available|format is not available/i,
          key: "noFormats",
        },
        {
          regex: /private video|video unavailable|video has been removed/i,
          key: "privateVideo",
        },
        {
          regex: /connection|timeout|network|ssl error|unable to download/i,
          key: "networkError",
        },
        { regex: /blob:|doesn't make any sense/i, key: "invalidUrl" },
      ];

      const matchedError = errorPatterns.find((pattern) =>
        data.match(pattern.regex),
      );

      if (matchedError) {
        setCmdProcessing(false);
        toast.error(t(`uploadPage.${matchedError.key}`));
      }
    });

    await ytDlpSidecar.spawn();
  }

  return (
    <Dialog open={cmdProcessing === true ? cmdProcessing : undefined}>
      <DialogTrigger className="ripple relative flex w-64 items-center justify-center rounded-lg border border-border p-2">
        <Ripple />
        <p>{t("uploadPage.downloadFromInternetDialogBtn")}</p>
        <svg
          width="20"
          className="absolute right-2"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 512 512"
          xmlSpace="preserve"
          fill="currentColor"
        >
          <g strokeWidth="0"></g>
          <g strokeLinecap="round" strokeLinejoin="round"></g>
          <g>
            <g>
              <path d="M255.994,0.006C114.607,0.013,0.012,114.612,0,256c0.012,141.387,114.607,255.986,255.994,255.994 C397.393,511.986,511.992,397.387,512,256C511.992,114.612,397.393,0.013,255.994,0.006z M97.607,97.612 c23.34-23.328,51.761-41.475,83.455-52.725c-15.183,18.375-27.84,41.906-37.757,69.116H82.772 C87.452,108.308,92.396,102.824,97.607,97.612z M65.612,138.003h69.986c-9.008,31.929-14.41,67.834-15.363,105.997H32.327 C34.374,205.196,46.3,169.088,65.612,138.003z M65.612,373.997C46.3,342.912,34.374,306.804,32.327,268h87.991 c0.961,38.124,6.21,74.092,15.206,105.998H65.612z M97.607,414.386c-5.211-5.211-10.156-10.695-14.836-16.39h60.573 c4.28,11.774,9.019,22.944,14.312,33.21c6.954,13.438,14.758,25.468,23.348,35.89C149.332,455.846,120.931,437.699,97.607,414.386z M243.998,479.667c-3.746-0.196-7.469-0.477-11.164-0.86c-5.89-2.64-11.722-6.25-17.5-10.961 c-17.632-14.359-33.976-38.671-46.398-69.85h75.061V479.667z M243.998,373.997h-83.436c-9.477-31.171-15.316-67.311-16.328-105.998 h99.763V373.997z M243.998,244H144.31c1.008-38.71,6.875-74.819,16.359-105.997h83.33V244z M243.998,114.003h-74.951 c3.109-7.79,6.367-15.312,9.934-22.195c10.64-20.625,23.17-36.89,36.354-47.656c5.777-4.71,11.609-8.32,17.5-10.96 c3.695-0.382,7.417-0.664,11.164-0.859V114.003z M446.392,138.003c19.312,31.085,31.234,67.194,33.281,105.997h-87.991 c-0.961-38.124-6.21-74.092-15.21-105.997H446.392z M414.393,97.612c5.211,5.211,10.156,10.696,14.836,16.391h-60.577 c-4.281-11.773-9.023-22.945-14.312-33.21c-6.953-13.437-14.758-25.468-23.347-35.89C362.668,56.16,391.065,74.301,414.393,97.612z M267.998,32.333c3.746,0.195,7.469,0.484,11.16,0.859c5.89,2.649,11.723,6.25,17.504,10.96 c17.636,14.359,33.976,38.671,46.397,69.85h-75.061V32.333z M267.998,138.003h83.436c9.476,31.171,15.32,67.31,16.328,105.997 h-99.764V138.003z M267.998,268h99.685c-1.007,38.71-6.874,74.818-16.359,105.998h-83.326V268z M296.661,467.846 c-5.781,4.711-11.614,8.313-17.504,10.961c-3.691,0.375-7.414,0.664-11.16,0.86v-81.67h74.951 c-3.109,7.789-6.367,15.312-9.933,22.195C322.376,440.816,309.845,457.081,296.661,467.846z M414.393,414.386 c-23.336,23.328-51.764,41.476-83.459,52.725c15.187-18.375,27.835-41.905,37.757-69.115h60.538 C424.548,403.692,419.604,409.176,414.393,414.386z M446.392,373.997h-69.998c9.008-31.929,14.414-67.842,15.367-105.998h87.912 C477.626,306.804,465.704,342.912,446.392,373.997z"></path>
            </g>
          </g>
        </svg>
      </DialogTrigger>
      <DialogContent>
        <form
          autoComplete="off"
          onSubmit={onSubmit}
          className="grid w-full items-center gap-1.5"
          dir={i18n.dir()}
        >
          <Label htmlFor="url">
            {t("uploadPage.downloadFromInternetLabel")}
          </Label>
          <Input
            disabled={cmdProcessing}
            onChange={(e) => setUrl(e.currentTarget.value)}
            type="url"
            id="url"
            autoComplete="off"
            placeholder={t("uploadPage.downloadFromInternetPlaceholder")}
          />
          <Label htmlFor="url">{t("uploadPage.mediaTypeLabel")}</Label>
          <Select
            defaultValue={mediaType}
            onValueChange={(value) => setMediaType(value as YtDlpMediaType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">
                {t("uploadPage.videoOption")}
              </SelectItem>
              <SelectItem value="audio">
                {t("uploadPage.audioOption")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="url">{t("uploadPage.qualityLabel")}</Label>
          <Select
            defaultValue={quality}
            onValueChange={(value) => setQuality(value as QualityType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">{t("uploadPage.highOption")}</SelectItem>
              <SelectItem value="medium">
                {t("uploadPage.mediumOption")}
              </SelectItem>
              <SelectItem value="low">{t("uploadPage.lowOption")}</SelectItem>
            </SelectContent>
          </Select>
          <button
            disabled={cmdProcessing || !url}
            className="ripple transform rounded-lg bg-foreground px-4 py-2 font-bold text-background disabled:bg-foreground/50"
            type="submit"
          >
            <Ripple />
            <div className="flex items-center justify-center">
              {cmdProcessing
                ? t("uploadPage.downloadInProgress")
                : t("uploadPage.downloadFromInternetBtn")}
            </div>
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DownloadFromInternet;
