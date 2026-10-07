import type { TypographyValue } from "@/components/editor/fields/TypographyFields";
import type { SpeechTheme } from "@/components/editor/speech/SpeechThemePreview";
import type { ActionValue } from "@/components/editor/fields/ActionFields";
import type { ChoiceItem } from "@/components/editor/fields/ChoiceListEditor";
import type { ImageValue } from "@/components/editor/fields/ImageFields";

export type TitleSettingsValue = {
  text: string;
  typography: TypographyValue;
  typewriter: boolean;
};

export type TitleBlock = {
  id: string;
  type: "title";
  simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: TitleSettingsValue;
};

/** 通常テキストの本文・文字設定・個別の文字送り設定。 */
export type TextSettingsValue = {
  text: string;
  textTheme: "normal" | "rpg";
  typography: TypographyValue;
  typewriter: boolean;
};

/** 複数行の通常テキストを表示するブロック。 */
export type TextBlock = {
  id: string;
  type: "text";
  simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: TextSettingsValue;
};

/** 現時点で追加・編集・書き出しに対応しているブロック。 */
export type ProjectBlock = TitleBlock | TextBlock | SpeechBlock | IconBlock | ImageBlock | ButtonBlock | AnswerBlock | MultiAnswerBlock;

/** 単一回答と多答回答で共用する、1つの解答欄。 */
export type AnswerFieldValue = {
  id: string;
  type: "text" | "single" | "multiple";
  label: string;
  placeholder: string;
  beforeText: string;
  afterText: string;
  candidates: string[];
  choices: ChoiceItem[];
};

/** 回答ブロック共通の送信・判定後アクションと文字設定。 */
export type AnswerCommonSettings = {
  instruction: string;
  submitLabel: string;
  successLabel: string;
  errorMessage: string;
  successMessage: string;
  animation: "shake" | "none";
  action: ActionValue;
  typography: TypographyValue;
};

export type AnswerBlock = {
  id: string; type: "answer"; simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: AnswerCommonSettings & { answer: AnswerFieldValue };
};

export type MultiAnswerBlock = {
  id: string; type: "multiAnswer"; simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: AnswerCommonSettings & { answers: AnswerFieldValue[]; showIndividualResults: boolean };
};

export type IconBlock = {
  id: string; type: "icon"; simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: {
    title: string; text: string; icon: string;
    backgroundColor: string; textColor: string; rounded: boolean;
    titleTypography: TypographyValue; typography: TypographyValue;
  };
};

export type ImageBlock = {
  id: string; type: "image"; simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: ImageValue;
};

export type ButtonBlock = {
  id: string; type: "button"; simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: {
    text: string; action: ActionValue; backgroundColor: string; textColor: string;
    typography: TypographyValue;
  };
};

/** キャラクター情報はブロック内に保存し、登録キャラクターの変更とは独立させる。 */
export type SpeechSettingsValue = {
  imageUrl: string;
  characterName: string;
  text: string;
  typography: TypographyValue;
  speechTheme: SpeechTheme;
};

/** RPGモードでは本文を常に文字送りする吹き出しブロック。 */
export type SpeechBlock = {
  id: string;
  type: "speech";
  simultaneous: boolean;
  /** RPGモードで直前の文字送り終了後に自動表示する。 */
  afterPreviousTyping: boolean;
  settings: SpeechSettingsValue;
};

/** ページ全体の表示方法。tapFadeはタップ進行にフェードインを加える。 */
export type DisplayMode = "normal" | "scroll" | "tap" | "tapFade" | "rpg";

/** 保存・書き出しの対象となるページ全体の設定。 */
export type PageSettingsValue = {
  /** WordPress側の閲覧進捗を保存する際に使う識別名。 */
  progressStorageKey: string;
  defaultTextColor: string;
  defaultFontFamily: string;
  displayMode: DisplayMode;
  /** RPG文字送りの1文字あたりの待ち時間（ミリ秒）。 */
  typewriterInterval: number;
  showLecture: boolean;
  lectureText: string;
  showProgressReset: boolean;
};

export type ProjectData = {
  schemaVersion: 1;
  pageSettings: PageSettingsValue;
  blocks: ProjectBlock[];
};
