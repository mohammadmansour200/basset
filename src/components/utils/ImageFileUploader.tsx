import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";

interface IImageFileUploaderProps {
  setImageFilePath: React.Dispatch<React.SetStateAction<string>>;
  imageFilePath: string;
}

function ImageFileUploader({
  setImageFilePath,
  imageFilePath,
}: IImageFileUploaderProps) {
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
    if (selectedImageFile) {
      setImageFilePath(selectedImageFile.path as string);
    }
  }

  return (
    <div className="flex w-[250px] items-center gap-2">
      <div className="flex-grow">
        <ImageIcon />
      </div>
      <button
        onClick={onUploadImageBtnClick}
        className="rounded-md bg-muted px-3 py-1 font-semibold"
      >
        {imageFilePath === "" ? (
          <p>{t("tabs.uploadImageBtn")}</p>
        ) : (
          <p className="text-blue-500">...{imageFilePath.slice(15)}</p>
        )}
      </button>
    </div>
  );
}

export default ImageFileUploader;

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      version="1.1"
      width="24px"
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
