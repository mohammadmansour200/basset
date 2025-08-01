import { listen } from "@tauri-apps/api/event";
import { ask } from "@tauri-apps/plugin-dialog";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { ThemeProvider } from "./contexts/ThemeProvider";

import FileUpload from "./components/screens/FileUpload/FileUpload";
import Header from "./components/ui/Header/Header";
import Home from "./components/screens/Home/Home";
import "react-ripple-click/dist/index.css";
import useFFmpeg from "./hooks/useFFmpeg";
import useSpleeter from "./hooks/useSpleeter";
import { useFileStore } from "./stores/useFileStore";
import { Toaster } from "./components/ui/Sonner";

function App() {
  const { filePath, setFilePath } = useFileStore();
  const { t, i18n } = useTranslation();
  const { killFFmpeg } = useFFmpeg();
  const { killSpleeter } = useSpleeter();

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
        killFFmpeg();
        killSpleeter();
      });
    }
    onAppExit();
  }, [killFFmpeg, killSpleeter]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <Header />
      <Toaster dir={i18n.dir()} richColors position="top-center" />
      <main>
        {/* If file path is asigned show tabs, or else show file uploader screen */}
        {filePath === "" && <FileUpload setFilePath={setFilePath} />}
        {filePath !== "" && <Home filePath={filePath} />}
      </main>
    </ThemeProvider>
  );
}

export default App;
