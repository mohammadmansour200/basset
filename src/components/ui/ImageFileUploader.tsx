import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { useTranslation } from "react-i18next";
import { Ripple } from "react-ripple-click";

interface ImageFileUploaderProps {
  setImageFilePath: React.Dispatch<React.SetStateAction<string>>;
  imageFilePath: string;
}

function ImageFileUploader({
  setImageFilePath,
  imageFilePath,
}: ImageFileUploaderProps) {
  const { t } = useTranslation();

  async function onUploadImageBtnClick() {
    const selectedImageFile = await open({
      multiple: false,
      filters: [
        {
          name: "Image",
          extensions: ["png", "webp", "jpg", "jpeg"],
        },
      ],
    });
    if (selectedImageFile && selectedImageFile !== undefined) {
      setImageFilePath(selectedImageFile);
    }
  }

  return (
    <div className="flex w-[250px] justify-center">
      {imageFilePath === "" ? (
        <button
          onClick={onUploadImageBtnClick}
          className="flex justify-center rounded-md border-2 border-dashed border-border"
        >
          <div className="ripple flex w-[90vw] cursor-pointer flex-col items-center border-border bg-muted py-[10vh] hover:bg-accent md:w-[500px]">
            <Ripple />
            <ImageIcon />
            <h3>{t("tabs.uploadImageBtn")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("tabs.uploadImageDescription")}
            </p>
          </div>
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex justify-center rounded-md border-2 border-dashed border-border">
            <div className="ripple flex h-[200px] w-[90vw] flex-col items-center border-border py-[10vh] md:w-[500px]">
              <img
                className="absolute inset-0 h-full w-full object-contain"
                src={convertFileSrc(imageFilePath)}
                alt="Selected Image"
              />
            </div>
          </div>
          <p>{imageFilePath.split("/").pop()}</p>
        </div>
      )}
    </div>
  );
}

export default ImageFileUploader;

function ImageIcon() {
  return (
    <svg
      role="graphics-symbol"
      viewBox="0 0 16 16"
      fill="none"
      version="1.1"
      width="20px"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 12.4142V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V8.4142C14 8.149 13.8946 7.8946 13.7071 7.7071L12.7071 6.7071C12.3166 6.3166 11.6834 6.3166 11.2929 6.7071L8.7071 9.2929C8.3166 9.6834 7.6834 9.6834 7.2929 9.2929L6.7071 8.7071C6.3166 8.3166 5.68342 8.3166 5.29289 8.7071L2.29289 11.7071C2.10536 11.8946 2 12.149 2 12.4142zM4.5 6C5.32843 6 6 5.32843 6 4.5C6 3.67157 5.32843 3 4.5 3C3.67157 3 3 3.67157 3 4.5C3 5.32843 3.67157 6 4.5 6zM3 0H13C14.6569 0 16 1.34315 16 3V13C16 14.6569 14.6569 16 13 16H3C1.34315 16 0 14.6569 0 13V3C0 1.34315 1.34315 0 3 0z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  );
}
