import type { ProjectData } from "@/types/project";
import type { SavedCharacter } from "@/lib/characterStorage";

/** 編集中の画像と登録キャラクターから、空欄を除いたURL一覧を重複なく取得する。 */
export function collectImageUrls(project: ProjectData, characters: SavedCharacter[]): string[] {
  const urls = project.blocks.flatMap((block) => block.type === "speech" ? [block.settings.imageUrl] : block.type === "image" ? [block.settings.url] : []);
  return [...new Set([...urls, ...characters.map((character) => character.imageUrl)].filter((url) => url.trim()))];
}

/** 完全一致する画像URLのみ置換し、本文やリンク先、ブロックIDは保持する。 */
export function replaceProjectImageUrls(project: ProjectData, before: string, after: string): ProjectData {
  return { ...project, blocks: project.blocks.map((block) => {
    if (block.type === "speech" && block.settings.imageUrl === before) return { ...block, settings: { ...block.settings, imageUrl: after } };
    if (block.type === "image" && block.settings.url === before) return { ...block, settings: { ...block.settings, url: after } };
    return block;
  }) };
}
