import { listen } from "@tauri-apps/api/event";
import { ask } from "@tauri-apps/plugin-dialog";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { killCommand } from "./utils/ffmpeg";

import { ThemeProvider } from "./contexts/ThemeProvider";

import FileUpload from "./components/ui/FileUpload";
import Header from "./components/ui/Header";
import Tabs from "./components/ui/Tabs";
import { Ripple } from "react-ripple-click";
import "react-ripple-click/dist/index.css";

function App() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const { t } = useTranslation();

  //Remove context menu
  useEffect(() => {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }, []);

  useEffect(() => {
    async function checkForUpdates() {
      //Prevent checking for updates if user clicked on the no thanks button
      if (localStorage.getItem("update")) return;

      const update = await check();

      if (update?.available) {
        //If there is an update, prompt the user with the update dialog
        const updateAskDialog = await ask(t("updater.updaterMessage"), {
          okLabel: t("updater.okLabel"),
          cancelLabel: t("updater.cancelLabel"),
          title: `${t("updater.updaterTitle")} ${update.version}`,
        });
        //If user clicks the update button
        if (updateAskDialog) {
          await update.downloadAndInstall();
          await relaunch();
        } else localStorage.setItem("update", "cancel");
      }
    }
    checkForUpdates();
  }, [t]);

  //Kill FFmpeg commands on app exit
  useEffect(() => {
    async function onAppExit() {
      await listen<string>("tauri://close-requested", () => {
        killCommand();
      });
    }
    onAppExit();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <Header>
        {/* Remove back button if current state is file uploading */}
        {filePath !== null && (
          <button
            onClick={() => {
              setFilePath(null);
              killCommand();
            }}
            className="ripple rounded-full"
          >
            <Ripple />
            <BackIcon />
          </button>
        )}
      </Header>
      <main>
        {/* If file path is asigned show tabs, or else show file uploader */}
        {filePath === null ? (
          <FileUpload setFilePath={setFilePath} />
        ) : (
          <Tabs filePath={filePath} />
        )}
      </main>
    </ThemeProvider>
  );
}

export default App;

function BackIcon() {
  return (
    <svg
      className="ltr:rotate-360 rtl:rotate-180"
      fill="currentColor"
      width="15px"
      height="15px"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z"></path>
      </g>
    </svg>
  );
}
