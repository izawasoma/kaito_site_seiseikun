import pcBaseStyles from "./styles/pc/style.css?raw";
import pcHintStyles from "./styles/pc/style3.css?raw";
import spBaseStyles from "./styles/sp/style_sp.css?raw";
import spHintStyles from "./styles/sp/style3_sp.css?raw";

/**
 * 本番のPCテーマでstyle.cssとstyle3.cssの間に読み込まれる補助CSS。
 */
const pcAdditionalStyles = `
body article .article_top h2 { color: #424242 !important; }
body.event article h2 { color: #FF3C62; }
body.event .side .date { color: #FF3C62; }
body.column article h2 { color: #2bd67b; }
.single .type1_box a:hover { color: #424242; }
`;

/**
 * PC用のWordPressテーマCSS。
 *
 * @remarks
 * 本番と同じ順序で結合する。
 * CSS内の相対画像パスは、本番テーマの画像URLへ変換する。
 * 元のCSSファイルは変更しない。
 */
export const wordpressPcStyles = [
  pcBaseStyles,
  pcAdditionalStyles,
  pcHintStyles,
]
  .join("\n")
  .replaceAll(
    "../images/",
    "https://www.scrapmagazine.com/wp-content/themes/scrap/images/",
  );

/**
 * SP用のWordPressテーマCSS。
 *
 * @remarks
 * 本番と同じ順序で結合し、テーマ内の画像パスを補完する。
 * lsizeの指定は、SPテーマのルートCSSにある追加スタイル。
 */
export const wordpressSpStyles = [
  spBaseStyles,
  spHintStyles,
  ".lsize img { width: 100%; }",
]
  .join("\n")
  .replaceAll(
    "../images/",
    "https://www.scrapmagazine.com/wp-content/themes/scrap_sp/images/",
  );
