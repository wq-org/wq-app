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
        <Button onClick={() => changeLanguage("en")}>English</Button>
        <Button onClick={() => changeLanguage("de")}>Deutsch</Button>
        <Button onClick={() => changeLanguage("es")}>Español</Button>
        <Button onClick={() => changeLanguage("pt")}>Português</Button>
        <Button onClick={() => changeLanguage("hi")}>हिन्दी</Button>
        <Button onClick={() => changeLanguage("fil")}>Filipino</Button>
      </div>

      <Button type="button">{t("navigation.getStarted")}</Button>
    </div>
  );
}

export default App;
