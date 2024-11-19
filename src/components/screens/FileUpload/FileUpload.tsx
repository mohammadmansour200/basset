import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Ripple } from "react-ripple-click";
import OnBoardDialog from "./OnBoardDialog";
import { getMediaDuration } from "@/utils/ffmpegHelperUtils";
import { useFile } from "@/contexts/FileProvider";

interface FileUploadProps {
  setFilePath: (filePath: string) => void;
}

function FileUpload({ setFilePath }: FileUploadProps) {
  const { t } = useTranslation();
  const { setDuration } = useFile();

  const onFileUpload = useCallback(
    async function onFileUpload() {
      const selectedFile = await open({
        multiple: false,
        filters: [
          {
            name: "Video/Audio",
            extensions: [
              "mp4",
              "avi",
              "mov",
              "mkv",
              "wmv",
              "flv",
              "webm",
              "aac",
              "mp3",
              "ogg",
              "wav",
            ],
          },
        ],
      });
      if (selectedFile === undefined) return;
      await getMediaDuration(selectedFile as string).then((data) => {
        setDuration(data);

        setFilePath(selectedFile as string);
      });
    },
    [setFilePath, setDuration],
  );

  //Press ctrl+O to open the file uploader
  useEffect(() => {
    function registerShorcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        onFileUpload();
      }
    }
    document.addEventListener("keydown", registerShorcut);

    return () => document.removeEventListener("keydown", registerShorcut);
  }, [onFileUpload]);

  return (
    <>
      <OnBoardDialog />
      <div className="flex h-[100vh] flex-col items-center justify-center gap-3 text-center">
        <div className="">
          <img
            draggable={false}
            src="/appIcon.png"
            className="w-56"
            alt="Basset logo"
          />
        </div>
        <hr className="mt-2 h-[2px] w-[90vw] border-none bg-border md:w-[600px]" />
        <button
          onClick={onFileUpload}
          className="flex justify-center rounded-md border-2 border-dashed border-border"
        >
          <div className="ripple flex w-[90vw] cursor-pointer flex-col items-center border-border bg-muted py-[10vh] hover:bg-accent md:w-[600px]">
            <Ripple />
            <OpenFileIcon />
            {t("uploadPage.uploadFileLabel")}
          </div>
        </button>
      </div>
    </>
  );
}

export default FileUpload;

function OpenFileIcon() {
  return (
    <svg
      role="graphics-symbol"
      viewBox="0 0 24 24"
      width="30px"
      height="30px"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5754 23.2323C17.2093 23.6996 16.6397 24 16 24H2C0.89543 24 0 23.1046 0 22V6H5C5.55228 6 6 5.55228 6 5V0H16C17.1046 0 18 0.89543 18 2V6.75463C16.6304 5.65672 14.8919 5 13 5C8.58172 5 5 8.58172 5 13C5 17.4183 8.58172 21 13 21C13.7166 21 14.4113 20.9058 15.0722 20.729L17.5754 23.2323ZM0.341411 4C0.943981 2.29517 2.29517 0.943981 4 0.341411V4H0.341411ZM17.8603 16.5189C17.9545 16.5659 18.0428 16.6286 18.1213 16.7071L23.1213 21.7071C23.5118 22.0976 23.5118 22.7308 23.1213 23.1213C22.7308 23.5118 22.0976 23.5118 21.7071 23.1213L16.7071 18.1213C16.6286 18.0428 16.5659 17.9545 16.5189 17.8603C15.5304 18.5773 14.3146 19 13 19C9.68629 19 7 16.3137 7 13C7 9.68629 9.68629 7 13 7C16.3137 7 19 9.68629 19 13C19 14.3146 18.5773 15.5304 17.8603 16.5189ZM13 17C15.2091 17 17 15.2091 17 13C17 10.7909 15.2091 9 13 9C10.7909 9 9 10.7909 9 13C9 15.2091 10.7909 17 13 17Z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  );
}
