import { useTranslation } from "react-i18next";
import { Ripple } from "react-ripple-click";

interface ITabItemProps {
  cmdProcessing: boolean;
  name: string;
}
function TabItem({ cmdProcessing, name }: ITabItemProps) {
  const { t } = useTranslation();
  return (
    <button
      style={{ cursor: cmdProcessing ? "not-allowed" : "" }}
      data-tab={name}
      className="ripple z-10 rounded-md px-2 py-1 font-semibold transition-all hover:bg-background/50"
    >
      <Ripple />
      {t(`tabs.${name}Tab`)}
    </button>
  );
}

export default TabItem;
