import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { platform } from "@tauri-apps/plugin-os";

import { getIsAudio } from "@/utils/fsUtils";

import TabItem from "./TabItem";
import ConvertToAudio from "@/components/ui/Tabs/ConvertToAudio";
import Convert from "@/components/ui/Tabs/Convert";
import Compress from "@/components/ui/Tabs/Compress";
import Quality from "@/components/ui/Tabs/Quality";
import Trim from "@/components/ui/Tabs/Trim";
import Cut from "@/components/ui/Tabs/Cut";
import ConvertToVideo from "@/components/ui/Tabs/ConvertToVideo";
import { useFile } from "@/contexts/FileProvider";
import RemoveMusic from "@/components/ui/Tabs/RemoveMusic";

interface HomeProps {
  filePath: string;
}

const platformName = platform();

function Home({ filePath }: HomeProps) {
  const [tab, setTab] = useState(
    platformName === "windows" ? "spleeter" : "trim",
  );
  console.log(platformName);
  const { i18n } = useTranslation();
  const navElRef = useRef<HTMLDivElement>(null);
  const activeIndicatorElRef = useRef<HTMLDivElement>(null);
  const { cmdProcessing } = useFile();
  const isAudio = getIsAudio(filePath);

  function onTabClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (cmdProcessing) return;
    const clickedTab = e.target as HTMLElement;
    const tabName = clickedTab.getAttribute("data-tab");
    if (!tabName) return;

    setTab(tabName);
  }

  useEffect(() => {
    function getCurrentTab() {
      const activeTabEl = document.querySelector(
        `[data-tab=${tab}]`,
      ) as HTMLElement;

      if (
        activeIndicatorElRef.current &&
        activeTabEl !== null &&
        navElRef !== null
      ) {
        navElRef.current?.scroll({
          behavior: "smooth",
          left: activeTabEl.offsetLeft,
        });
        activeIndicatorElRef.current.style.transform = `translateX(${activeTabEl.offsetLeft}px)`;
        activeIndicatorElRef.current.style.width = `${activeTabEl.offsetWidth}px`;
        activeIndicatorElRef.current.style.opacity = "1";
      }
    }
    getCurrentTab();
  }, [tab, i18n.language]);

  return (
    <div className="mt-16 flex flex-col items-center justify-center">
      <nav
        id="navbar"
        ref={navElRef}
        className="relative m-2 my-3 flex max-w-full overflow-hidden overflow-x-auto rounded-md bg-muted p-1 min-[580px]:max-w-none"
        dir="ltr"
      >
        <div
          ref={activeIndicatorElRef}
          tabIndex={-1}
          className="ease-cubic absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-t-[10px] bg-foreground opacity-0 transition-[width,transform] duration-200 ltr:origin-left rtl:origin-right"
        ></div>
        <div
          onClick={onTabClick}
          className="flex gap-2 whitespace-nowrap"
          style={{ direction: `${i18n.dir() === "ltr" ? "ltr" : "rtl"}` }}
        >
          {platformName === "windows" && <TabItem name="spleeter" />}
          <TabItem name="trim" />
          <TabItem name="cut" />
          <TabItem name="convert" />
          {!isAudio && (
            <>
              <TabItem name="convertToAudio" />
              <TabItem name="compress" />
            </>
          )}
          <TabItem name="quality" />
          {isAudio && <TabItem name="convertToVideo" />}
        </div>
      </nav>

      {tab === "trim" && <Trim />}
      {tab === "cut" && <Cut />}
      {tab === "spleeter" && <RemoveMusic />}
      {tab === "compress" && <Compress />}
      {tab === "convert" && <Convert />}
      {tab === "convertToAudio" && <ConvertToAudio />}
      {tab === "convertToVideo" && <ConvertToVideo />}
      {tab === "quality" && <Quality />}
    </div>
  );
}

export default Home;
