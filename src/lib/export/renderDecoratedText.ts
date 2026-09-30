import { escapeHtml } from "./escapeHtml";
import { theme } from "@/styles/theme";

type DecorationName = "red" | "blue" | "green" | "yellow" | "bold" | "ruby";

/** 閉じタグを待っている装飾。未完成の場合は元の開始タグを文字として戻す。 */
type DecorationFrame = {
  name: DecorationName | null;
  openingTag: string;
  reading: string;
  position: number;
  fragments: string[];
};

const decorationColors = {
  red: theme.colors.red,
  blue: theme.colors.deepBlue,
  green: theme.colors.green,
  yellow: theme.colors.yellow,
};

/** 完成した装飾だけを、許可したHTML要素と固定のスタイルへ変換する。 */
function renderDecoration(frame: DecorationFrame): string {
  const content = frame.fragments.join("");

  if (frame.name === "ruby") {
    // 読みが空の編集中は、本文だけを表示する。
    if (!frame.reading) return content;
    return `<ruby>${content}<rp>（</rp><rt>${escapeHtml(frame.reading)}</rt><rp>）</rp></ruby>`;
  }

  if (frame.name === "bold") {
    return `<strong style="font-weight: ${theme.fontWeights.bold}">${content}</strong>`;
  }

  if (frame.name && frame.name in decorationColors) {
    const color = decorationColors[frame.name as keyof typeof decorationColors];
    return `<span style="color: ${color}">${content}</span>`;
  }

  return content;
}

/**
 * 独自の装飾タグをHTMLに変換する。色・太字・ルビの入れ子にも対応する。
 *
 * @remarks
 * 通常のHTMLや不正なタグはエスケープし、入力をそのまま実行しない。
 * 閉じ忘れたタグは文字として表示し、入力途中でもページ構造を壊さない。
 * 改行には属性付きbrを使い、autopによる連続改行の段落化を防ぐ。
 * @param text - 装飾タグを含む入力文字列。
 * @returns 共用するHTMLと、問題箇所を示すエラーメッセージ。
 */
export function parseDecoratedText(text: string): { html: string; errors: string[] } {
  const rootFrame: DecorationFrame = {
    name: null,
    openingTag: "",
    reading: "",
    position: 0,
    fragments: [],
  };
  const frameStack = [rootFrame];
  const errors: string[] = [];
  let position = 0;
  const tokens = text.split(/(<ruby="[^"\r\n]*">|<\/?(?:red|blue|green|yellow|bold)>|<\/ruby>|<\/?[a-zA-Z][^<>]*>|<\/?[a-zA-Z][^<>]*$)/g);

  for (const token of tokens) {
    const currentFrame = frameStack[frameStack.length - 1];
    const openingMatch = token.match(/^<(red|blue|green|yellow|bold)>$/);
    const rubyMatch = token.match(/^<ruby="([^"\r\n]*)">$/);
    const closingMatch = token.match(/^<\/(red|blue|green|yellow|bold|ruby)>$/);

    if (openingMatch || rubyMatch) {
      frameStack.push({
        name: rubyMatch ? "ruby" : (openingMatch![1] as DecorationName),
        openingTag: token,
        reading: rubyMatch?.[1] ?? "",
        position,
        fragments: [],
      });
    } else if (closingMatch && currentFrame.name === closingMatch[1]) {
      frameStack.pop();
      const parentFrame = frameStack[frameStack.length - 1];
      parentFrame.fragments.push(renderDecoration(currentFrame));
    } else {
      if (closingMatch) {
        errors.push(`${position + 1}文字目：${token}に対応する開始タグがないか、入れ子の順序が違います`);
      } else if (/^<\/?[a-zA-Z]/.test(token)) {
        errors.push(`${position + 1}文字目：未定義のタグ、または装飾タグの書式が不正です`);
      }
      currentFrame.fragments.push(
        escapeHtml(token).replace(/\r\n|\r|\n/g, '<br data-conversation-break="">'),
      );
    }
    position += token.length;
  }

  while (frameStack.length > 1) {
    const unfinishedFrame = frameStack.pop()!;
    const parentFrame = frameStack[frameStack.length - 1];
    errors.push(`${unfinishedFrame.position + 1}文字目：${unfinishedFrame.openingTag}の閉じタグがありません`);
    parentFrame.fragments.push(
      escapeHtml(unfinishedFrame.openingTag) + unfinishedFrame.fragments.join(""),
    );
  }

  return { html: rootFrame.fragments.join(""), errors };
}

/** 装飾文字列から、書き出しに使うHTMLだけを取得する。 */
export function renderDecoratedText(text: string): string {
  return parseDecoratedText(text).html;
}
