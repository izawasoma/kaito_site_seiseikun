/** プレビューで再現する表示環境。 */
export type PreviewDevice = "pc" | "sp";

/**
 * 表示環境ごとの基準幅とviewport指定。
 *
 * @remarks
 * SPはメタタグの変更だけでは再現できないため、
 * iframeの幅も730pxに設定する。
 */
export const previewEnvironments = {
  pc: {
    width: 1030,
    viewport: "width=device-width, initial-scale=1",
  },
  sp: {
    width: 730,
    viewport: "width=730px,user-scalable=no",
  },
} as const;
