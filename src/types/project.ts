import type { TypographyValue } from "@/components/editor/fields/TypographyFields";

export type TitleSettingsValue = {
  text: string;
  typography: TypographyValue;
  typewriter: boolean;
};

export type TitleBlock = {
  id: string;
  type: "title";
  simultaneous: boolean;
  settings: TitleSettingsValue;
};

// 今はタイトルだけ。対応するブロックを順次追加します。
export type ProjectBlock = TitleBlock;

export type ProjectData = {
  schemaVersion: 1;
  blocks: ProjectBlock[];
};
