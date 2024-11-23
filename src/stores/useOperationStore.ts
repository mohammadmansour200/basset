import { Child } from "@tauri-apps/plugin-shell";
import { create } from "zustand";

type State = {
  cmdProcessing: boolean;
  logs: string[];
  process: Child | null;
};

type Action = {
  setCmdProcessing: (cmdProcessing: State["cmdProcessing"]) => void;
  setLogs: (logs: State["logs"]) => void;
  setProcess: (process: State["process"]) => void;
};

export const useOperationStore = create<State & Action>((set) => ({
  cmdProcessing: false,
  logs: [""],
  process: null,
  setCmdProcessing: (cmdProcessing) =>
    set(() => ({ cmdProcessing: cmdProcessing })),
  setLogs: (logs) => set(() => ({ logs: logs })),
  setProcess: (process) => set(() => ({ process: process })),
}));
