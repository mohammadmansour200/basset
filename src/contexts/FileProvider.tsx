import { createContext, useContext, useState } from "react";

type FileProviderProps = {
  children: React.ReactNode;
};

type FileProviderState = {
  filePath: string;
  duration: number;
  setFilePath: (filePath: string) => void;
  setDuration: (duration: number) => void;
};

const initialState: FileProviderState = {
  filePath: "",
  duration: 0,
  setFilePath: () => {},
  setDuration: () => {},
};

const FileProviderContext = createContext(initialState);

export function FileProvider({
  children,
  ...props
}: FileProviderProps) {
  const [filePath, setFilePath] = useState("");
  const [duration, setDuration] = useState(0);
  const value = {
    filePath,
    duration,
    setFilePath: (filePath: string) => {
      setFilePath(filePath);
    },
    setDuration: (duration: number) => {
      setDuration(duration);
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
