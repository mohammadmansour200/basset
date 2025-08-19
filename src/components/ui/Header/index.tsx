import { ask, message } from "@tauri-apps/plugin-dialog";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OperationType, useOperationStore } from "@/stores/useOperationStore";
import { useFileStore } from "@/stores/useFileStore";

import LanguageSelect from "./LanguageSelect";
import { ModeToggle } from "./ModeToggle";
import NotficationPromptBtn from "./NotficationPromptBtn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Ripple } from "react-ripple-click";
import { Check, Copy } from "lucide-react";

function Header() {
  const [updateChecking, setUpdateChecking] = useState<boolean | null>(null);
  const [updateDownloading, setUpdateDownloading] = useState<boolean | null>(
    null,
  );
  const [isCopied, setIsCopied] = useState(false);

  const { i18n, t } = useTranslation();
  const { setFilePath, setMediaType, setPreviewImage } = useFileStore();
  const { logs, cmdProcessing, operationType, setOperationType } =
    useOperationStore();

  async function onCheckForUpdatesBtnClick() {
    setUpdateChecking(true);
    const update = await check();
    setUpdateChecking(null);

    if (update?.available) {
      //If there is an update, prompt the user with the update dialog
      const updateAskDialog = await ask(t("updater.updaterMessage"), {
        okLabel: t("updater.okLabel"),
        cancelLabel: t("updater.cancelLabel"),
        title: `${t("updater.updaterTitle")} ${update.version}`,
      });
      //If user clicks the update button
      if (updateAskDialog) {
        setUpdateDownloading(true);
        await update.downloadAndInstall();
        await relaunch();
      }
    } else {
      await message(t("noUpdate.message"), { okLabel: t("noUpdate.okLabel") });
    }
  }

  return (
    <header
      className="fixed top-0 z-30 flex h-12 w-full items-center justify-between gap-1.5 border-b border-border bg-background p-4 text-center"
      dir={i18n.dir()}
    >
      <div className="flex items-center gap-10">
        <div>
          {operationType && (
            <button
              disabled={cmdProcessing}
              onClick={() => {
                setFilePath("");
                setOperationType(null);
                setMediaType(null);
                setPreviewImage(null);
              }}
              className="ripple rounded-full"
            >
              <Ripple />
              <BackIcon />
            </button>
          )}
        </div>
        <h3>
          {operationType === OperationType.TRIM &&
            t("operations.trimOperation")}
          {operationType === OperationType.CUT && t("operations.cutOperation")}
          {operationType === OperationType.SPLEETER &&
            t("operations.spleeterOperation")}
          {operationType === OperationType.COMPRESS &&
            t("operations.compressOperation")}
          {operationType === OperationType.CONVERT &&
            t("operations.convertOperation")}
          {operationType === OperationType.QUALITY_DOWNGRADE &&
            t("operations.qualityOperation")}
        </h3>
      </div>
      <div className="flex items-center gap-1 p-1">
        <Dialog>
          <DialogTrigger className="mt-[2px] inline-block">
            <BugIcon />
          </DialogTrigger>
          <DialogContent className="gap-2">
            <DialogTitle className="text-center">
              {t("bugModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("bugModalDesc")}
            </DialogDescription>
            <div
              dir="ltr"
              role="log"
              aria-live="polite"
              className="flex h-[250px] max-h-[250px] flex-col-reverse overflow-y-auto rounded-md bg-accent p-4"
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(logs.join("\n"));
                  setIsCopied(true);
                  setTimeout(function () {
                    setIsCopied(false);
                  }, 2000);
                }}
                className="fixed right-7 top-20 m-1 rounded-md bg-background p-1.5"
              >
                {isCopied ? <Check width={19} /> : <Copy width={19} />}
              </button>
              <pre className="text-wrap font-mono text-sm">
                {logs.join("\n")}
              </pre>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger className="inline-block">
            <SettingsIcon />
          </DialogTrigger>
          <DialogContent className="gap-2">
            <DialogTitle className="text-center">
              {t("settingsBtnTitle")}
            </DialogTitle>
            <LanguageSelect className="mt-3" />
            <ModeToggle />
            <hr className="my-2 h-[2px] border-none bg-border" />
            <NotficationPromptBtn />
            <button
              onClick={onCheckForUpdatesBtnClick}
              className="rounded-md bg-muted py-2 transition-colors duration-300 hover:bg-muted/50"
            >
              {updateDownloading && t("header.updateDownloading")}
              {updateChecking && t("header.updateLoading")}
              {!updateChecking && !updateDownloading && t("header.update")}
            </button>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

export default Header;

function BugIcon() {
  const { t } = useTranslation();
  return (
    <svg
      viewBox="0 0 24 24"
      width="22px"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{t("bugModalTitle")}</title>
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path
          d="M17.416 2.62412C17.7607 2.39435 17.8538 1.9287 17.624 1.58405C17.3943 1.23941 16.9286 1.14628 16.584 1.37604L13.6687 3.31955C13.1527 3.11343 12.5897 3.00006 12.0001 3.00006C11.4105 3.00006 10.8474 3.11345 10.3314 3.31962L7.41603 1.37604C7.07138 1.14628 6.60573 1.23941 6.37596 1.58405C6.1462 1.9287 6.23933 2.39435 6.58397 2.62412L8.9437 4.19727C8.24831 4.84109 7.75664 5.70181 7.57617 6.6719C8.01128 6.55973 8.46749 6.50006 8.93763 6.50006H15.0626C15.5328 6.50006 15.989 6.55973 16.4241 6.6719C16.2436 5.70176 15.7519 4.841 15.0564 4.19717L17.416 2.62412Z"
          fill="currentColor"
        ></path>
        <path
          d="M1.25 14.0001C1.25 13.5859 1.58579 13.2501 2 13.2501H5V11.9376C5 11.1019 5.26034 10.327 5.70435 9.68959L3.22141 8.69624C2.83684 8.54238 2.6498 8.10589 2.80366 7.72131C2.95752 7.33673 3.39401 7.1497 3.77859 7.30356L6.91514 8.55841C7.50624 8.20388 8.19807 8.00006 8.9375 8.00006H15.0625C15.8019 8.00006 16.4938 8.20388 17.0849 8.55841L20.2214 7.30356C20.606 7.1497 21.0425 7.33673 21.1963 7.72131C21.3502 8.10589 21.1632 8.54238 20.7786 8.69624L18.2957 9.68959C18.7397 10.327 19 11.1019 19 11.9376V13.2501H22C22.4142 13.2501 22.75 13.5859 22.75 14.0001C22.75 14.4143 22.4142 14.7501 22 14.7501H19V15.0001C19 16.1808 18.7077 17.2932 18.1915 18.2689L20.7786 19.3039C21.1632 19.4578 21.3502 19.8943 21.1963 20.2789C21.0425 20.6634 20.606 20.8505 20.2214 20.6966L17.3288 19.5394C16.1974 20.8664 14.5789 21.7655 12.75 21.9604V15.0001C12.75 14.5858 12.4142 14.2501 12 14.2501C11.5858 14.2501 11.25 14.5858 11.25 15.0001V21.9604C9.42109 21.7655 7.80265 20.8664 6.67115 19.5394L3.77859 20.6966C3.39401 20.8505 2.95752 20.6634 2.80366 20.2789C2.6498 19.8943 2.83684 19.4578 3.22141 19.3039L5.80852 18.2689C5.29231 17.2932 5 16.1808 5 15.0001V14.7501H2C1.58579 14.7501 1.25 14.4143 1.25 14.0001Z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  );
}

function SettingsIcon() {
  const { t } = useTranslation();
  return (
    <svg
      className="inline-block"
      width="22px"
      height="24px"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{t("settingsBtnTitle")}</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"
      />
    </svg>
  );
}

function BackIcon() {
  const { t } = useTranslation();
  return (
    <svg
      className="ltr:rotate-360 rtl:rotate-180"
      fill="currentColor"
      width="15px"
      height="15px"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{t("backBtnTitle")}</title>
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z"></path>
      </g>
    </svg>
  );
}
