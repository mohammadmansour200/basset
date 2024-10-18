import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getIsAudio } from "@/utils/fsUtils";

import TabItem from "./TabItem";
import ConvertToAudio from "@/components/ui/Tabs/ConvertToAudio";
import Convert from "@/components/ui/Tabs/Convert";
import Compress from "@/components/ui/Tabs/Compress";
import Quality from "@/components/ui/Tabs/Quality";
import Trim from "@/components/ui/Tabs/Trim";
import Cut from "@/components/ui/Tabs/Cut";
import ConvertToVideo from "@/components/ui/Tabs/ConvertToVideo";

interface HomeProps {
  filePath: string;
}

function Home({ filePath }: HomeProps) {
  const [tab, setTab] = useState("trim");
  const [cmdProcessing, setCmdProcessing] = useState(false);

  const { i18n } = useTranslation();
  const navElRef = useRef<HTMLDivElement>(null);
  const activeIndicatorElRef = useRef<HTMLDivElement>(null);

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
          <TabItem name="trim" cmdProcessing={cmdProcessing} />
          <TabItem name="cut" cmdProcessing={cmdProcessing} />
          <TabItem name="convert" cmdProcessing={cmdProcessing} />
          {!isAudio && (
            <>
              <TabItem name="convertToAudio" cmdProcessing={cmdProcessing} />
              <TabItem name="compress" cmdProcessing={cmdProcessing} />
            </>
          )}
          <TabItem name="quality" cmdProcessing={cmdProcessing} />
          {isAudio && (
            <TabItem name="convertToVideo" cmdProcessing={cmdProcessing} />
          )}
        </div>
      </nav>

      {tab === "trim" && <Trim setCmdProcessing={setCmdProcessing} />}
      {tab === "cut" && <Cut setCmdProcessing={setCmdProcessing} />}
      {tab === "compress" && <Compress setCmdProcessing={setCmdProcessing} />}
      {tab === "convert" && <Convert setCmdProcessing={setCmdProcessing} />}
      {tab === "convertToAudio" && (
        <ConvertToAudio setCmdProcessing={setCmdProcessing} />
      )}
      {tab === "convertToVideo" && (
        <ConvertToVideo setCmdProcessing={setCmdProcessing} />
      )}
      {tab === "quality" && <Quality setCmdProcessing={setCmdProcessing} />}
    </div>
  );
}

export default Home;
