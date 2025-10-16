import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{t("welcome")}</h1>
      <p className="text-center max-w-md">{t("description")}</p>
      <div className="flex gap-2">
    
      </div>
    </div>
  );
}

export default App;
