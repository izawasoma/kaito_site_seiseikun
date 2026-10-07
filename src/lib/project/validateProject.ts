import { usesReaderProgress } from "./pageHelp";
import type { AnswerFieldValue, ProjectBlock, ProjectData } from "@/types/project";
import { parseDecoratedText } from "@/lib/export/renderDecoratedText";
import { countDecoratedCharacters } from "@/lib/export/countDecoratedCharacters";
import { getImageUrl } from "@/lib/getImageUrl";
import { getLinkUrl } from "@/lib/getLinkUrl";

/** 保存時には許す入力途中の値を、公開前に検証する。 */
export function validateBlock(block: ProjectBlock): string[] {
  const errors: string[] = [];
  const settings = block.settings;
  function required(value: string, label: string) {
    if (!value.trim()) errors.push(`${label}を入力してください。`);
  }
  function decorated(value: string, label: string) {
    errors.push(...parseDecoratedText(value).errors.map((error) => `${label}：${error}`));
  }
  function answer(field: AnswerFieldValue, label: string) {
    decorated(field.label, `${label}のラベル`);
    if (field.type !== "multiple") {
      decorated(field.beforeText, `${label}の前の文章`);
      decorated(field.afterText, `${label}の後ろの文章`);
    } else field.choices.forEach((item) => decorated(item.label, `${label}の選択肢`));
    if (field.type === "text") {
      if (!field.candidates.length || field.candidates.some((candidate) => !candidate.trim())) errors.push(`${label}：正解候補を登録してください。`);
    } else {
      if (!field.choices.length || field.choices.some((choice) => !choice.label.trim())) errors.push(`${label}：選択肢ラベルを入力してください。`);
      const correctCount = field.choices.filter((choice) => choice.correct).length;
      if (field.type === "single" ? correctCount !== 1 : correctCount === 0) errors.push(`${label}：正解の選択肢を${field.type === "single" ? "1つだけ" : "1つ以上"}設定してください。`);
    }
  }
  if ("typography" in settings) {
    const size = Number(settings.typography.fontSize);
    if (!Number.isFinite(size) || size < 1) errors.push("文字サイズは1以上にしてください。");
  }
  if ("text" in settings) {
    required(settings.text, block.type === "button" ? "ボタンラベル" : "本文");
    decorated(settings.text, block.type === "button" ? "ボタンラベル" : "本文");
  }
  if ("action" in settings && settings.action.type === "link" && !getLinkUrl(settings.action.url)) errors.push("有効な遷移先URLを入力してください。");
  if ("backgroundColor" in settings) {
    if (!/^#[0-9a-f]{6}$/i.test(settings.backgroundColor) || !/^#[0-9a-f]{6}$/i.test(settings.textColor)) errors.push("背景色・文字色を6桁のカラーコードで入力してください。");
  }
  switch (block.type) {
    case "speech":
      required(block.settings.characterName, "キャラクター名");
      decorated(block.settings.characterName, "キャラクター名");
      if (!getImageUrl(block.settings.imageUrl)) errors.push("有効なキャラクター画像URLを入力してください。");
      if (countDecoratedCharacters(block.settings.text) > 100) errors.push("メッセージは100文字以内にしてください。");
      break;
    case "image":
      if (!getImageUrl(block.settings.url)) errors.push("httpまたはhttpsの画像URLを入力してください。");
      break;
    case "icon": {
      required(block.settings.title, "タイトル");
      decorated(block.settings.title, "タイトル");
      if (!/^[a-z0-9_]+$/.test(block.settings.icon)) errors.push("アイコン名は半角英小文字・数字・アンダースコアで入力してください。");
      const titleSize = Number(block.settings.titleTypography.fontSize);
      if (!Number.isFinite(titleSize) || titleSize < 1) errors.push("タイトルの文字サイズは1以上にしてください。");
      break;
    }
    case "answer": case "multiAnswer": {
      required(block.settings.submitLabel, "送信ボタンラベル");
      required(block.settings.errorMessage, "不正解時メッセージ");
      decorated(block.settings.instruction, "入力注意事項");
      decorated(block.settings.submitLabel, "送信ボタンラベル");
      decorated(block.settings.successMessage, "正解時メッセージ");
      decorated(block.settings.errorMessage, "不正解時メッセージ");
      if (block.settings.action.type === "link" && block.settings.action.allowRepeat) decorated(block.settings.successLabel, "正解後のラベル");
      if (block.type === "answer") answer(block.settings.answer, "回答欄");
      else {
        if (!block.settings.answers.length) errors.push("解答欄を1つ以上追加してください。");
        block.settings.answers.forEach((field, index) => {
          required(field.label, `解答欄${index + 1}のラベル`);
          answer(field, `解答欄${index + 1}`);
        });
      }
      break;
    }
  }
  return errors;
}

/** 公開に必要なページ設定と、ブロック番号付きの修正箇所を返す。 */
export function validateProject(project: ProjectData): string[] {
  const errors: string[] = [];
  if (project.pageSettings.showLecture) errors.push(...parseDecoratedText(project.pageSettings.lectureText).errors.map((error) => `レクチャー本文：${error}`));
  if (!project.blocks.length) errors.push("ブロックを追加してください。");
  const needsProgress = usesReaderProgress(project);
  if (needsProgress && !project.pageSettings.progressStorageKey.trim()) errors.push("ページ設定：進行保存用キー名を入力してください。他の記事と重複しない名前を使用します。");
  if (!/^#[0-9a-f]{6}$/i.test(project.pageSettings.defaultTextColor)) errors.push("ページ設定：文字色を6桁のカラーコードで入力してください。");
  if (project.pageSettings.displayMode === "rpg" && (!Number.isFinite(project.pageSettings.typewriterInterval) || project.pageSettings.typewriterInterval < 1)) errors.push("ページ設定：文字送り速度は1以上にしてください。");
  project.blocks.forEach((block, index) => errors.push(...validateBlock(block).map((error) => `ブロック${index + 1}：${error}`)));
  return errors;
}
