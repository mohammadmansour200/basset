import { Child } from "@tauri-apps/plugin-shell";
import { create } from "zustand";

type State = {
  cmdProcessing: boolean;
  logs: string[];
  process: Child | null;
};

type Action = {
  setCmdProcessing: (cmdProcessing: State["cmdProcessing"]) => void;
  setLogs: (logs:  State["logs"] | string) => void;
  setProcess: (process: State["process"]) => void;
};

export const useOperationStore = create<State & Action>((set) => ({
  cmdProcessing: false,
  logs: [],
  process: null,
  setCmdProcessing: (cmdProcessing) =>
    set(() => ({ cmdProcessing: cmdProcessing })),
  setLogs: (logs) => 
    set((state) => ({ 
      logs: Array.isArray(logs) ? logs : [...state.logs, logs] 
    })),
  setProcess: (process) => set(() => ({ process: process })),
}));
