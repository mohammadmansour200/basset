import { BaseDirectory, appLocalDataDir, extname } from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/api/fs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import FormatSelect from "../utils/FormatSelect";
import ExecuteBtn from "../utils/ExecuteBtn";
import QualitySelect from "../utils/QualitySelect";
import CompressSlider from "../utils/CompressSlider";
import formatTimestamp from "@/utils/timestampFormatter";
import ImageFileUploader from "../utils/ImageFileUploader";
import AudioQualitySelect from "../utils/AudioQualitySelect";

import { Ripple } from "react-ripple-click";
import AVPlayer from "./AV/AVPlayer";

interface ITabsProps {
  filePath: string;
}

function Tabs({ filePath }: ITabsProps) {
  const [tab, setTab] = useState("cut");
  const [isAudio, setIsAudio] = useState(false);
  const [outputFormat, setOutputFormat] = useState("");
  const [txtFilePath, setTxtFilePath] = useState("");
  const [imageFilePath, setImageFilePath] = useState("");
  const [quality, setQuality] = useState("1280:720");
  const [audioQuality, setAudioQuality] = useState("128k");
  const [compressRate, setCompressRate] = useState(8);
  const [cmdProcessing, setCmdProcessing] = useState(false);
  const [cutTimestamps, setCutTimestamps] = useState<[number, number]>([
    4, 100,
  ]);
  const { i18n, t } = useTranslation();
  const navElRef = useRef<HTMLDivElement>(null);
  const activeIndicatorElRef = useRef<HTMLDivElement>(null);

  function onTabClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (cmdProcessing) return;
    const clickedTab = e.target as HTMLElement;
    const tabName = clickedTab.getAttribute("data-tab");
    if (!tabName) return;

    setTab(tabName);
  }

  useEffect(() => {
    async function checkFileExt() {
      const ext = await extname(filePath);
      //Set isAudio state to true if file path extension is audio
      if (ext === "mp3" || ext === "ogg" || ext === "aac") {
        setIsAudio(true);
      } else setIsAudio(false);
    }
    checkFileExt();
  }, [filePath]);

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

  //this text file basically is for the cutting timestamps
  useEffect(() => {
    async function getTxtFilePath() {
      if (tab === "cut") {
        const txtFilePath = await appLocalDataDir();
        setTxtFilePath(`${txtFilePath}inputTxtFiles`);
      }
    }
    getTxtFilePath();
  }, [tab]);

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
          <button
            style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
            data-tab="cut"
            className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
          >
            <Ripple />
            {t("tabs.cutTab")}
          </button>
          <button
            style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
            data-tab="trim"
            className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
          >
            <Ripple />
            {t("tabs.trimTab")}
          </button>
          <button
            style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
            data-tab="compress"
            className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
          >
            <Ripple />
            {t("tabs.compressTab")}
          </button>
          <button
            style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
            data-tab="convert"
            className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
          >
            <Ripple />
            {t("tabs.convertorTab")}
          </button>
          {!isAudio && (
            <>
              <button
                style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
                data-tab="convertToAudio"
                className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
              >
                <Ripple />
                {t("tabs.vidToAudioTab")}
              </button>
              <button
                style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
                data-tab="quality"
                className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
              >
                <Ripple />
                {t("tabs.vidQualityTab")}
              </button>
            </>
          )}
          {isAudio && (
            <button
              style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
              data-tab="convertToVideo"
              className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
            >
              <Ripple />
              {t("tabs.audioToVidTab")}
            </button>
          )}
        </div>
      </nav>
      {tab === "convertToAudio" && (
        <div className="flex flex-col items-center gap-2">
          <FormatSelect isAudio={true} setFormat={setOutputFormat} />
          <ExecuteBtn
            setCmdProcessing={setCmdProcessing}
            text={t("tabs.convertBtn")}
            inputFilePath={filePath}
            outputFormat={outputFormat}
            command="-vn"
          />
        </div>
      )}
      {tab === "compress" && (
        <div className="flex flex-col items-center gap-2">
          {isAudio ? (
            <AudioQualitySelect setAudioQuality={setAudioQuality} />
          ) : (
            <CompressSlider
              compressRate={compressRate}
              setCompressRate={setCompressRate}
            />
          )}
          <ExecuteBtn
            setCmdProcessing={setCmdProcessing}
            text={t("tabs.startBtn")}
            inputFilePath={filePath}
            command={
              isAudio ? `-b:a ${audioQuality}` : `-crf ${compressRate + 20}`
            }
          />
        </div>
      )}
      {tab === "quality" && (
        <div className="flex flex-col items-center gap-2">
          <QualitySelect setQuality={setQuality} />
          <ExecuteBtn
            setCmdProcessing={setCmdProcessing}
            text={t("tabs.startBtn")}
            inputFilePath={filePath}
            command={`-vf scale=${quality}`}
          />
        </div>
      )}
      {tab === "convert" && (
        <div className="flex flex-col items-center gap-2">
          <FormatSelect isAudio={isAudio} setFormat={setOutputFormat} />
          <ExecuteBtn
            setCmdProcessing={setCmdProcessing}
            text={t("tabs.convertBtn")}
            inputFilePath={filePath}
            outputFormat={outputFormat}
            command=""
          />
        </div>
      )}
      {tab === "trim" && (
        <div className="flex flex-col items-center gap-2">
          <AVPlayer
            isAudio={isAudio}
            srcPath={filePath}
            cutType="trim"
            cutTimestamps={cutTimestamps}
            setCutTimestamps={setCutTimestamps}
          />
          <ExecuteBtn
            cmdCustom
            setCmdProcessing={setCmdProcessing}
            text={t("tabs.cutBtn")}
            inputFilePath={filePath}
            command={[
              "-ss",
              `${formatTimestamp(cutTimestamps[0])}`,
              "-i",
              `${filePath}`,
              "-c",
              "copy",
              "-t",
              `${formatTimestamp(cutTimestamps[1])}`,
            ]}
          />
        </div>
      )}
      {tab === "cut" && (
        <div className="flex flex-col items-center gap-2">
          <AVPlayer
            isAudio={isAudio}
            srcPath={filePath}
            cutType="cut"
            cutTimestamps={cutTimestamps}
            setCutTimestamps={setCutTimestamps}
          />
          <ExecuteBtn
            setCmdProcessing={setCmdProcessing}
            text={t("tabs.cutBtn")}
            inputFilePath={filePath}
            customFunc={async () =>
              await writeTextFile(
                "inputTxtFiles/input.txt",
                `file '${filePath}'
inpoint ${cutTimestamps[0]}
outpoint ${cutTimestamps[1]}`,
                {
                  dir: BaseDirectory.AppLocalData,
                },
              )
            }
            cmdCustom
            command={[
              "-f",
              "concat",
              "-safe",
              "0",
              "-i",
              `${txtFilePath}/input.txt`,
              "-c",
              "copy",
            ]}
          />
        </div>
      )}
      {tab === "convertToVideo" && (
        <div className="flex flex-col items-center gap-2">
          <ImageFileUploader
            setImageFilePath={setImageFilePath}
            imageFilePath={imageFilePath}
          />
          <ExecuteBtn
            cmdCustom
            disabled={imageFilePath === "" ? true : false}
            setCmdProcessing={setCmdProcessing}
            text={t("tabs.convertBtn")}
            inputFilePath={filePath}
            outputFormat="mp4"
            command={[
              "-r",
              "1",
              "-loop",
              "1",
              "-i",
              `${imageFilePath}`,
              "-i",
              `${filePath}`,
              "-acodec",
              "copy",
              "-r",
              "1",
              "-pix_fmt",
              "yuv420p",
              "-tune",
              "stillimage",
              "-shortest",
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default Tabs;
