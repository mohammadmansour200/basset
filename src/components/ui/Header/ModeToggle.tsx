import { useTranslation } from "react-i18next";

import { Moon, Sun } from "lucide-react";

import { DirectionProvider } from "@radix-ui/react-direction";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { useTheme } from "@/contexts/ThemeProvider";
import { cn } from "@/utils/cn";

interface ModeToggleProps extends React.HTMLAttributes<HTMLDivElement> {}
export function ModeToggle({ className }: ModeToggleProps) {
  const { setTheme, theme } = useTheme();
  const { t, i18n } = useTranslation();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DirectionProvider dir={i18n.dir()}>
        <Sun className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.3rem] w-[1.3rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <Select
          value={theme}
          onValueChange={(value) => setTheme(value)}
          dir={i18n.dir()}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t("navbar.accountMenu.languageSelectPlaceholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t("header.lightMode")}</SelectItem>
            <SelectItem value="dark">{t("header.darkMode")}</SelectItem>
            <SelectItem value="system">{t("header.system")}</SelectItem>
          </SelectContent>
        </Select>
      </DirectionProvider>
    </div>
  );
}
