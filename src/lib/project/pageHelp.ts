import type { DisplayMode, ProjectData } from "@/types/project";

/** 編集・復元・初期文言リセットで共用する案内。動作確認済みとは断定しない。 */
const legacyLectureText = `【表示・操作について】
通常表示：表示可能な内容をまとめて表示します。
スクロールフェードイン：下へスクロールすると内容が順番に表示されます。
タップで進む：画面をタップ（PCではクリック）すると次の内容を表示します。
タップで進む＋：タップで進み、内容がふわっと表示されます。
文字送り：文章が一文字ずつ表示されます。表示中にタップすると全文を表示し、表示後のタップで次へ進みます。設定によっては次の内容が自動で表示されます。
回答欄では正解するまで、進行ボタンではボタンを押すまで、次へ進めません。

【進捗の保存について】
進捗を保存するページでは、同じ端末・同じブラウザでこのページを開くと、保存された続きから再開できます。別の端末やブラウザには引き継がれません。
プライベートブラウズやブラウザの設定によっては保存できない場合があります。閲覧データを削除すると進捗も消えることがあります。

【対応ブラウザについて】
最新版のSafari、Google Chrome、Microsoft Edge、Firefoxの利用を推奨します。JavaScriptとブラウザの保存機能を有効にしてください。SNSなどのアプリ内ブラウザでうまく動かない場合は、上記のブラウザで開いてください。`;

/** 選択中のモードだけを案内する。 */
const legacyModeDescriptions: Record<DisplayMode, string> = {
  normal: "通常表示：表示可能な内容をまとめて表示します。",
  scroll: "スクロールフェードイン：下へスクロールすると内容が順番に表示されます。",
  tap: "タップで進む：画面をタップ（PCではクリック）すると次の内容を表示します。",
  tapFade: "タップで進む＋：画面をタップ（PCではクリック）すると次の内容がふわっと表示されます。",
  rpg: "文字送り：文章が一文字ずつ表示されます。表示中にタップ（PCではクリック）すると全文を表示し、表示後のタップで次へ進みます。設定によっては次の内容が自動で表示されます。",
};

/** モード別の操作説明と共通の保存・ブラウザ案内を生成する。 */
function getLegacyModeLectureText(mode: DisplayMode): string {
  const common = legacyLectureText.slice(legacyLectureText.indexOf("回答欄では"))
    .replace("最新版のSafari、Google Chrome、Microsoft Edge、Firefox", "最新版のSafari、Google Chrome");
  return `【表示・操作について】\n${legacyModeDescriptions[mode]}\n${common}`;
}

/** プレイヤーが実際に行う操作を案内する。 */
const modeDescriptions: Record<DisplayMode, string> = {
  normal: "画面を下へスクロールしながら、読み進めてください。",
  scroll: "画面を下へスクロールすると、続きが順番に表示されます。",
  tap: "画面をタップすると、続きが表示されます。パソコンではクリックしてください。",
  tapFade: "画面をタップすると、続きがふわっと表示されます。パソコンではクリックしてください。",
  rpg: "文章が一文字ずつ表示されます。表示の途中で画面をタップすると、全文をすぐに読むことができます。読み終えたら、もう一度タップして先へ進んでください。パソコンではクリックしてください。",
};

/** 制作側の用語を使わず、操作・再開方法・利用ブラウザを説明する。 */
export function getDefaultLectureText(mode: DisplayMode): string {
  return `【遊び方】
${modeDescriptions[mode]}
回答欄が表示されたら、答えを入力して送信してください。正解すると先へ進めます。先へ進むボタンが表示されたら、そのボタンを押してください。

【途中で中断するときは】
保存された続きから再開するには、同じ端末・同じブラウザでこのページを開いてください。別の端末やブラウザには進捗を引き継げません。
プライベートブラウズでは、進捗が残らないことがあります。また、ブラウザの閲覧データを削除すると、続きから再開できなくなることがあります。

【ご利用のブラウザについて】
最新版のSafari、Google Chromeをご利用ください。SNSなどのアプリ内でうまく動かない場合は、SafariまたはGoogle Chromeでこのページを開き直してください。`;
}

export const defaultLectureText = getDefaultLectureText("normal");

/** 初期文言だけを現行モードへ移行し、利用者が編集した文章は保持する。 */
export function updateDefaultLecture(text: string, previousMode: DisplayMode, nextMode: DisplayMode): string {
  return text === legacyLectureText || text === getLegacyModeLectureText(previousMode) || text === getDefaultLectureText(previousMode) ? getDefaultLectureText(nextMode) : text;
}

/** スクロール・タップの閲覧状態、または全モードの回答突破状態を保存する構成か。 */
export function usesReaderProgress(project: ProjectData): boolean {
  return project.pageSettings.displayMode !== "normal" || project.blocks.some((block) =>
    block.type === "answer" || block.type === "multiAnswer" || (block.type === "button" && block.settings.action.type === "next"));
}
