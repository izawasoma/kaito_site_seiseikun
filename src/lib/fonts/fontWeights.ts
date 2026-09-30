import { japaneseFonts } from "./japaneseFonts";
import { theme } from "@/styles/theme";

export type FontWeightName = keyof typeof theme.fontWeights;
export const weightLabels: Record<FontWeightName, string> = {
  thin: "Thin", extraLight: "Extra Light", light: "Light", regular: "Regular",
  medium: "Medium", semiBold: "Semi Bold", bold: "Bold", extraBold: "Extra Bold", black: "Black",
};

/** 可変フォントは提供範囲内の標準ウェイト、静的フォントは提供値だけを返す。 */
export function availableFontWeights(family: string): FontWeightName[] {
  const specification = japaneseFonts.find((font) => font.family === family)?.weights ?? "100..900";
  const range = specification.includes("..") ? specification.split("..").map(Number) : null;
  const values = specification.split(";").map(Number);
  return (Object.keys(theme.fontWeights) as FontWeightName[]).filter((name) => {
    const weight = theme.fontWeights[name];
    return range ? weight >= range[0] && weight <= range[1] : values.includes(weight);
  });
}

/** 変更前の太さが非対応なら、提供される最も近い太さへ補正する。 */
export function supportedFontWeight(family: string, requested: FontWeightName): FontWeightName {
  const available = availableFontWeights(family);
  const target = theme.fontWeights[requested] ?? 400;
  return available.reduce((best, candidate) => Math.abs(theme.fontWeights[candidate] - target) < Math.abs(theme.fontWeights[best] - target) ? candidate : best, available[0] ?? "regular");
}
