import { ask } from "@tauri-apps/plugin-dialog";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import { ThemeProvider } from "./contexts/ThemeProvider";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useOperationStore } from "./stores/useOperationStore";

import FileUpload from "./components/screens/FileUpload/FileUpload";
import Header from "./components/ui/Header/Header";
import Operation from "./components/screens/Operation/Operation";
import { Toaster } from "./components/ui/Sonner";
import "react-ripple-click/dist/index.css";

function App() {
  const { operationType } = useOperationStore();
  const { t, i18n } = useTranslation();

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
  console.log(operationType);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <Header />
      <Toaster dir={i18n.dir()} richColors position="top-center" />
      <main>
        {/* If operationType path is asigned show tabs, or else show file uploader screen */}
        {!operationType && <FileUpload />}
        {operationType && <Operation />}
      </main>
    </ThemeProvider>
  );
}

export default App;
