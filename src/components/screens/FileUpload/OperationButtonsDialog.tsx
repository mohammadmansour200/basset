import { useTranslation } from "react-i18next";

import { useFileStore } from "@/stores/useFileStore";
import {
  MediaType,
  OperationType,
  useOperationStore,
} from "@/stores/useOperationStore";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Ripple } from "react-ripple-click";
import { platform } from "@tauri-apps/plugin-os";

const platformName = platform();

function OperationButtonsDialog() {
  const { t, i18n } = useTranslation();
  const { filePath, setFilePath } = useFileStore();
  const { mediaType, setOperationType } = useOperationStore();
  return (
    <Dialog onOpenChange={() => setFilePath("")} open={filePath !== ""}>
      <DialogContent dir={i18n.dir()} className="gap-1">
        <DialogTitle className="mb-2 text-center">
          {t("operationButtonsModal")}
        </DialogTitle>

        {/* Quality downgrading: Video, Audio and Image */}
        <button
          onClick={() => setOperationType(OperationType.QUALITY_DOWNGRADE)}
          className="ripple flex w-full items-center gap-4 rounded-b-sm rounded-t-lg bg-foreground px-4 py-3 text-left text-background"
        >
          <CompressIcon />
          <span>{t("operations.qualityOperation")}</span>
          <Ripple />
        </button>

        {/* Music removal, Trimming and Cutting: Video and Audio */}
        {(mediaType === MediaType.AUDIO || mediaType === MediaType.VIDEO) && (
          <>
            {platformName !== "macos" && (
              <button
                onClick={() => setOperationType(OperationType.SPLEETER)}
                className="ripple flex w-full items-center gap-4 rounded-sm bg-foreground px-4 py-3 text-left text-background"
              >
                <SpleeterIcon />
                <span>{t("operations.spleeterOperation")}</span>
                <Ripple />
              </button>
            )}
            <button
              onClick={() => setOperationType(OperationType.TRIM)}
              className="ripple flex w-full items-center gap-4 rounded-sm bg-foreground px-4 py-3 text-left text-background"
            >
              <CutIcon />
              <span>{t("operations.trimOperation")}</span>
              <Ripple />
            </button>
            <button
              onClick={() => setOperationType(OperationType.CUT)}
              className="ripple flex w-full items-center gap-4 rounded-sm bg-foreground px-4 py-3 text-left text-background"
            >
              <CutIcon />
              <span>{t("operations.cutOperation")}</span>
              <Ripple />
            </button>
          </>
        )}

        {/*Compress: Video only*/}
        {mediaType === MediaType.VIDEO && (
          <button
            onClick={() => setOperationType(OperationType.COMPRESS)}
            className="ripple flex w-full items-center gap-4 rounded-sm bg-foreground px-4 py-3 text-left text-background"
          >
            <CompressIcon />
            <span>{t("operations.compressOperation")}</span>
            <Ripple />
          </button>
        )}

        {/* Convert: Video, Audio and Image */}
        <button
          onClick={() => setOperationType(OperationType.CONVERT)}
          className="ripple flex w-full items-center gap-4 rounded-b-lg rounded-t-sm bg-foreground px-4 py-3 text-left text-background"
        >
          {mediaType === MediaType.AUDIO && <AudioConvertIcon />}
          {mediaType === MediaType.IMAGE && <ImageConvertIcon />}
          {mediaType === MediaType.VIDEO && <VideoConvertIcon />}
          <span>{t("operations.convertOperation")}</span>
          <Ripple />
        </button>
      </DialogContent>
    </Dialog>
  );
}

export default OperationButtonsDialog;

function SpleeterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      className="fill-background"
    >
      <path d="M764-84 84-764q-11-11-11-28t11-28q11-11 28-11t28 11l680 680q11 11 11 28t-11 28q-11 11-28 11t-28-11ZM560-680v70q0 20-12.5 29.5T520-571q-15 0-27.5-10T480-611v-189q0-17 11.5-28.5T520-840h160q17 0 28.5 11.5T720-800v80q0 17-11.5 28.5T680-680H560ZM400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-62l80 80v120q0 66-47 113t-113 47Z" />
    </svg>
  );
}
function AudioConvertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      className="fill-background"
    >
      <path d="M140-640q38-109 131.5-174.5T480-880q82 0 155.5 35T760-746v-134h80v240H600v-80h76q-39-39-90-59.5T480-800q-81 0-149.5 43T227-640h-87ZM420-80q-58 0-99-41t-41-99q0-58 41-99t99-41q16 0 31 3t29 10v-213h200v80H560v260q0 58-41 99t-99 41Z" />
    </svg>
  );
}
function ImageConvertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      className="fill-background"
    >
      <path d="M360-200h240l-79-103-58 69-39-52-64 86ZM320-80q-33 0-56.5-23.5T240-160v-320q0-33 23.5-56.5T320-560h320q33 0 56.5 23.5T720-480v320q0 33-23.5 56.5T640-80H320ZM140-640q38-109 131.5-174.5T480-880q82 0 155.5 35T760-746v-134h80v240H600v-80h76q-39-39-90-59.5T480-800q-81 0-149.5 43T227-640h-87Z" />
    </svg>
  );
}
function VideoConvertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      className="fill-background"
    >
      <path d="M140-640q38-109 131.5-174.5T480-880q82 0 155.5 35T760-746v-134h80v240H600v-80h76q-39-39-90-59.5T480-800q-81 0-149.5 43T227-640h-87ZM280-80q-33 0-56.5-23.5T200-160v-320q0-33 23.5-56.5T280-560h320q33 0 56.5 23.5T680-480v120l120-120v320L680-280v120q0 33-23.5 56.5T600-80H280Z" />
    </svg>
  );
}
function CompressIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      className="fill-background"
    >
      <path d="M160-400v-80h640v80H160Zm0-120v-80h640v80H160ZM440-80v-128l-64 64-56-56 160-160 160 160-56 56-64-62v126h-80Zm40-560L320-800l56-56 64 64v-128h80v128l64-64 56 56-160 160Z" />
    </svg>
  );
}
function CutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      className="fill-background"
    >
      <path d="m480-400-94 94q8 15 11 32t3 34q0 66-47 113T240-80q-66 0-113-47T80-240q0-66 47-113t113-47q17 0 34 3t32 11l94-94-94-94q-15 8-32 11t-34 3q-66 0-113-47T80-720q0-66 47-113t113-47q66 0 113 47t47 113q0 17-3 34t-11 32l438 438q27 27 12 61.5T783-120q-11 0-21.5-4.5T743-137L480-400Zm120-120-80-80 223-223q8-8 18.5-12.5T783-840q38 0 52.5 35T823-743L600-520ZM240-640q33 0 56.5-23.5T320-720q0-33-23.5-56.5T240-800q-33 0-56.5 23.5T160-720q0 33 23.5 56.5T240-640Zm240 180q8 0 14-6t6-14q0-8-6-14t-14-6q-8 0-14 6t-6 14q0 8 6 14t14 6ZM240-160q33 0 56.5-23.5T320-240q0-33-23.5-56.5T240-320q-33 0-56.5 23.5T160-240q0 33 23.5 56.5T240-160Z" />
    </svg>
  );
}
