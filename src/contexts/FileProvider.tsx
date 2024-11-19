import { createContext, useContext, useState } from "react";

type FileProviderProps = {
  children: React.ReactNode;
};

type FileProviderState = {
  filePath: string;
  duration: number;
  cmdProcessing: boolean;
  setFilePath: (filePath: string) => void;
  setDuration: (duration: number) => void;
  setCmdProcessing: (processing: boolean) => void;
};

const initialState: FileProviderState = {
  filePath: "",
  duration: 0,
  cmdProcessing: false,
  setFilePath: () => {},
  setDuration: () => {},
  setCmdProcessing: () => {},
};

const FileProviderContext = createContext(initialState);

export function FileProvider({ children, ...props }: FileProviderProps) {
  const [filePath, setFilePath] = useState("");
  const [cmdProcessing, setCmdProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const value = {
    filePath,
    duration,
    cmdProcessing,
    setFilePath: (filePath: string) => {
      setFilePath(filePath);
    },
    setDuration: (duration: number) => {
      setDuration(duration);
    },
    setCmdProcessing: (processing: boolean) => {
      setCmdProcessing(processing);
    },
  };

  return (
    <FileProviderContext.Provider {...props} value={value}>
      {children}
    </FileProviderContext.Provider>
  );
}

export const useFile = () => {
  const context = useContext(FileProviderContext);

  if (context === undefined)
    throw new Error("useFile must be used within a FileProvider");

  return context;
};
