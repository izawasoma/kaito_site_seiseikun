/** 制作用プロジェクトとは分離して、閲覧者のブラウザに保存する状態。 */
export type ReaderProgress = {
  version: 1;
  blocks: Record<string, { viewed: boolean; cleared: boolean; answers?: Record<string, string | string[]> }>;
};
