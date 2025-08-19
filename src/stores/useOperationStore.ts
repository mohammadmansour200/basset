import { Child } from "@tauri-apps/plugin-shell";
import { create } from "zustand";

export enum OperationType {
  TEST,
  CUT,
  TRIM,
  COMPRESS,
  QUALITY_DOWNGRADE,
  CONVERT,
  SPLEETER,
}

type State = {
  operationType: OperationType | null;
  cmdProcessing: boolean;
  logs: string[];
  process: Child | null;
};

type Action = {
  setOperationType: (type: State["operationType"]) => void;
  setCmdProcessing: (cmdProcessing: State["cmdProcessing"]) => void;
  setLogs: (logs: State["logs"] | string) => void;
  setProcess: (process: State["process"]) => void;
};

export const useOperationStore = create<State & Action>((set) => ({
  operationType: null,
  mediaType: null,
  cmdProcessing: false,
  logs: [],
  process: null,
  setOperationType: (type) => set(() => ({ operationType: type })),
  setCmdProcessing: (cmdProcessing) =>
    set(() => ({ cmdProcessing: cmdProcessing })),
  setLogs: (logs) =>
    set((state) => ({
      logs: Array.isArray(logs) ? logs : [...state.logs, logs],
    })),
  setProcess: (process) => set(() => ({ process: process })),
}));
