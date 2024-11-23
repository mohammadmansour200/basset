import { create } from "zustand";

type State = {
  filePath: string;
  duration: number;
};

type Action = {
  setFilePath: (filePath: State["filePath"]) => void;
  setDuration: (duration: State["duration"]) => void;
};

export const useFileStore = create<State & Action>((set) => ({
  filePath: "",
  duration: 0,
  setFilePath: (filePath) => set(() => ({ filePath: filePath })),
  setDuration: (duration) => set(() => ({ duration: duration })),
}));
