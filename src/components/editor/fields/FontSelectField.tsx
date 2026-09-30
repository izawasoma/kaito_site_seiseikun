import { useEffect } from "react";
import SelectField from "@/components/ui/form/SelectField";
import { japaneseFonts, fontFamilyStyle } from "@/lib/fonts/japaneseFonts";
import { supportedFontWeight } from "@/lib/fonts/fontWeights";
import { theme } from "@/styles/theme";

/** フォント見本は名前とウェイトラベルの文字だけを取得し、本文用の全字体取得を避ける。 */
export default function FontSelectField({ value, onChange, allowInherit = false, disabled = false }: {
  value: string; onChange: (family: string) => void; allowInherit?: boolean; disabled?: boolean;
}) {
  useEffect(() => {
    if (document.querySelector("[data-font-menu-sample]")) return;
    japaneseFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.dataset.fontMenuSample = "true";
      const sample = `${font.family} Thin Extra Light Regular Medium Semi Bold Black`;
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:wght@${font.weights}&text=${encodeURIComponent(sample)}&display=swap`;
      document.head.append(link);
    });
  }, []);
  const options = japaneseFonts.map((font) => ({
    value: font.family, label: font.family,
    style: { fontFamily: fontFamilyStyle(font.family), fontWeight: theme.fontWeights[supportedFontWeight(font.family, "regular")] },
  }));
  return <SelectField label="フォント" value={value} onValueChange={onChange} disabled={disabled}
    options={allowInherit ? [{ value: "inherit", label: "ページ設定を使用" }, ...options] : options} />;
}
