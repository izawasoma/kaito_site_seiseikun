import { getDefaultLectureText, updateDefaultLecture } from "./pageHelp";
import { japaneseFonts } from "@/lib/fonts/japaneseFonts";
import type { PageSettingsValue, ProjectBlock, ProjectData, AnswerFieldValue, AnswerCommonSettings } from "@/types/project";
import type { TypographyValue } from "@/components/editor/fields/TypographyFields";
import { createPageSettings } from "@/lib/createPageSettings";
import { theme } from "@/styles/theme";

/** 保存データの不正箇所を示す。編集途中の空欄は許可し、構造を検証する。 */
function invalid(field: string): never {
  throw new Error(`JSONの「${field}」の形式が正しくありません。`);
}

/** 配列やnullを除くオブジェクトとして読み取る。 */
function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return invalid(field);
  return value as Record<string, unknown>;
}

/** 文字列を読み取る。 */
function string(value: unknown, field: string): string {
  return typeof value === "string" ? value : invalid(field);
}

/** 真偽値を読み取る。 */
function boolean(value: unknown, field: string): boolean {
  return typeof value === "boolean" ? value : invalid(field);
}

/** 許可した選択肢のいずれかを読み取る。 */
function choice<T extends string>(value: unknown, options: readonly T[], field: string): T {
  return typeof value === "string" && options.includes(value as T) ? value as T : invalid(field);
}

/** 文字設定を検証する。未入力の文字サイズも編集中の値として保持する。 */
function readTypography(value: unknown): TypographyValue {
  const settings = record(value, "文字設定");
  return {
    alignment: choice(settings.alignment, ["left", "center", "right"], "配置"),
    fontFamily: choice(settings.fontFamily, ["inherit", ...japaneseFonts.map((font) => font.family)], "フォント"),
    fontWeight: choice(settings.fontWeight, Object.keys(theme.fontWeights) as TypographyValue["fontWeight"][], "文字の太さ"),
    fontSize: string(settings.fontSize, "文字サイズ"),
  };
}

/** ページ設定がなかった旧データには初期設定を補う。 */
function readPageSettings(value: unknown): PageSettingsValue {
  if (value === undefined) return createPageSettings();
  const settings = record(value, "ページ設定");
  const interval = settings.typewriterInterval ?? 40;
  const displayMode = choice(settings.displayMode, ["normal", "scroll", "tap", "tapFade", "rpg"], "表示モード");
  if (typeof interval !== "number" || !Number.isFinite(interval)) invalid("文字送り速度");
  return {
    progressStorageKey: string(settings.progressStorageKey, "進行保存用キー名"),
    defaultTextColor: string(settings.defaultTextColor, "文字色"),
    defaultFontFamily: choice(settings.defaultFontFamily, japaneseFonts.map((font) => font.family), "デフォルトフォント"),
    displayMode,
    typewriterInterval: interval,
    showLecture: boolean(settings.showLecture, "レクチャー設定"),
    lectureText: settings.lectureText === undefined ? getDefaultLectureText(displayMode) : updateDefaultLecture(string(settings.lectureText, "レクチャー本文"), displayMode, displayMode),
    showProgressReset: settings.showProgressReset === undefined ? false : boolean(settings.showProgressReset, "進捗削除ボタン"),
  };
}

/** アクションの構造を検証する。URLの入力途中は保存可能。 */
function readAction(value: unknown) {
  const action = record(value, "アクション");
  return { type: choice(action.type, ["next", "link"], "アクション種別"), url: string(action.url, "遷移先URL"), allowRepeat: action.allowRepeat === undefined ? false : boolean(action.allowRepeat, "２回目の実行") };
}

/** 解答欄の候補と選択肢を検証する。 */
function readAnswerField(value: unknown): AnswerFieldValue {
  const field = record(value, "解答欄");
  if (!Array.isArray(field.candidates) || !Array.isArray(field.choices)) invalid("正解候補・選択肢");
  const choices = field.choices.map((entry) => {
    const item = record(entry, "選択肢");
    return { id: string(item.id, "選択肢ID"), label: string(item.label, "選択肢ラベル"), correct: boolean(item.correct, "選択肢の正解設定") };
  });
  if (choices.some((item) => !item.id.trim()) || new Set(choices.map((item) => item.id)).size !== choices.length) invalid("選択肢ID");
  const id = string(field.id, "解答欄ID");
  if (!id.trim()) invalid("解答欄ID");
  return { id, type: choice(field.type, ["text", "single", "multiple"], "入力形式"),
    label: string(field.label, "解答欄ラベル"), placeholder: string(field.placeholder, "プレースホルダー"),
    beforeText: field.beforeText === undefined ? "" : string(field.beforeText, "入力欄前の文章"),
    afterText: field.afterText === undefined ? "" : string(field.afterText, "入力欄後ろの文章"),
    candidates: field.candidates.map((candidate) => string(candidate, "正解候補")), choices };
}

/** 回答の共通設定を検証する。 */
function readAnswerCommon(settings: Record<string, unknown>): AnswerCommonSettings {
  return { instruction: string(settings.instruction, "入力注意事項"), submitLabel: string(settings.submitLabel, "送信ラベル"),
    successLabel: settings.successLabel === undefined ? "次へ" : string(settings.successLabel, "正解後のラベル"),
    successMessage: settings.successMessage === undefined ? "正解です" : string(settings.successMessage, "正解時メッセージ"),
    errorMessage: string(settings.errorMessage, "不正解メッセージ"), animation: choice(settings.animation, ["shake", "none"], "不正解アニメーション"),
    action: readAction(settings.action), typography: readTypography(settings.typography) };
}

/** 種類ごとに設定を検証し、キャラクターの画像・名前もブロック内で復元する。 */
function readBlock(value: unknown): ProjectBlock {
  const block = record(value, "ブロック");
  const id = string(block.id, "ブロックID");
  if (!id.trim()) invalid("ブロックID");
  const afterPreviousTyping = block.afterPreviousTyping === undefined ? false : boolean(block.afterPreviousTyping, "文字送り後の表示");
  const simultaneous = boolean(block.simultaneous, "同時表示");
  const settings = record(block.settings, "ブロック設定");
  if (block.type === "image") {
    if (![500, 650, 860].includes(settings.width as number)) invalid("画像幅");
    return { id, type: "image", simultaneous, afterPreviousTyping, settings: { url: string(settings.url, "画像URL"), alt: string(settings.alt, "ALT"), width: settings.width as 500 | 650 | 860 } };
  }
  if (block.type === "button") return { id, type: "button", simultaneous, afterPreviousTyping, settings: {
    text: string(settings.text, "ボタンラベル"), action: readAction(settings.action), typography: readTypography(settings.typography),
    backgroundColor: string(settings.backgroundColor, "背景色"), textColor: string(settings.textColor, "文字色"),
  } };
  if (block.type === "icon") return { id, type: "icon", simultaneous, afterPreviousTyping, settings: {
    title: string(settings.title, "カードタイトル"), text: string(settings.text, "本文"), icon: string(settings.icon, "アイコン"),
    backgroundColor: string(settings.backgroundColor, "背景色"), textColor: string(settings.textColor, "文字色"), rounded: boolean(settings.rounded, "角丸"),
    titleTypography: readTypography(settings.titleTypography), typography: readTypography(settings.typography),
  } };
  if (block.type === "answer") return { id, type: "answer", simultaneous, afterPreviousTyping, settings: {
    ...readAnswerCommon(settings), answer: readAnswerField(settings.answer),
  } };
  if (block.type === "multiAnswer") {
    if (!Array.isArray(settings.answers)) invalid("解答欄一覧");
    const answers = settings.answers.map(readAnswerField);
    if (new Set(answers.map((field) => field.id)).size !== answers.length) invalid("解答欄IDの重複");
    return { id, type: "multiAnswer", simultaneous, afterPreviousTyping, settings: { ...readAnswerCommon(settings), answers,
      showIndividualResults: boolean(settings.showIndividualResults, "個別判定") } };
  }
  const text = string(settings.text, "本文");
  const typography = readTypography(settings.typography);
  switch (block.type) {
    case "text":
      return { id, type: "text", simultaneous, afterPreviousTyping, settings: {
        text, typography, typewriter: boolean(settings.typewriter, "個別文字送り"),
        textTheme: settings.textTheme === undefined ? "normal" : choice(settings.textTheme, ["normal", "rpg"], "テキストテーマ"),
      } };
    case "title":
      return { id, type: block.type, simultaneous, afterPreviousTyping, settings: {
        text, typography, typewriter: boolean(settings.typewriter, "個別文字送り"),
      } };
    case "speech":
      return { id, type: "speech", simultaneous, afterPreviousTyping, settings: {
        text, typography,
        imageUrl: string(settings.imageUrl, "キャラクター画像URL"),
        characterName: string(settings.characterName, "キャラクター名"),
        speechTheme: choice(settings.speechTheme, ["rpg", "normal", "rounded"], "吹き出しテーマ"),
      } };
    default:
      throw new Error("このアプリではまだ読み込めない種類のブロックが含まれています。");
  }
}

/** JSONファイルと自動保存で共用する検証。エラー時は現在の編集データを置き換えない。 */
export function parseProject(value: unknown): ProjectData {
  const project = record(value, "プロジェクト");
  if (project.schemaVersion !== 1) throw new Error("このJSONのデータバージョンには対応していません。");
  if (!Array.isArray(project.blocks)) return invalid("ブロック一覧");
  const blocks = project.blocks.map(readBlock);
  if (new Set(blocks.map((block) => block.id)).size !== blocks.length) {
    throw new Error("JSON内に重複したブロックIDがあります。");
  }
  return { schemaVersion: 1, pageSettings: readPageSettings(project.pageSettings), blocks };
}

/** ファイルのBOMを除去してJSONとして解析し、プロジェクトとして検証する。 */
export function parseProjectJson(text: string): ProjectData {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error("JSONファイルを解析できませんでした。ファイルの内容を確認してください。");
  }
  return parseProject(data);
}
