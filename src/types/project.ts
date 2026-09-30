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

/** 通常テキストの本文・文字設定・個別の文字送り設定。 */
export type TextSettingsValue = {
  text: string;
  typography: TypographyValue;
  typewriter: boolean;
};

/** 複数行の通常テキストを表示するブロック。 */
export type TextBlock = {
  id: string;
  type: "text";
  simultaneous: boolean;
  settings: TextSettingsValue;
};

/** 現時点で追加・編集・書き出しに対応しているブロック。 */
export type ProjectBlock = TitleBlock | TextBlock;

export type ProjectData = {
  schemaVersion: 1;
  blocks: ProjectBlock[];
};
