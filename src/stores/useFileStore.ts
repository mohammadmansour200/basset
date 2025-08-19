import { create } from "zustand";

export enum MediaType {
  IMAGE,
  AUDIO,
  VIDEO,
}

type State = {
  filePath: string;
  duration: number;
  size: number;
  mediaType: MediaType | null;
  previewImage: string | null;
};

type Action = {
  setFilePath: (filePath: State["filePath"]) => void;
  setDuration: (duration: State["duration"]) => void;
  setSize: (size: State["size"]) => void;
  setMediaType: (type: State["mediaType"]) => void;
  setPreviewImage: (type: State["previewImage"]) => void;
};

export const useFileStore = create<State & Action>((set) => ({
  filePath: "",
  duration: 0,
  size: 0,
  mediaType: null,
  previewImage: null,
  setFilePath: (filePath) => set(() => ({ filePath: filePath })),
  setDuration: (duration) => set(() => ({ duration: duration })),
  setSize: (size) => set(() => ({ size: size })),
  setMediaType: (type) => set(() => ({ mediaType: type })),
  setPreviewImage: (type) => set(() => ({ previewImage: type })),
}));
