export type CharacterDraft = {
  imageUrl: string;
  characterName: string;
};

export type SavedCharacter = CharacterDraft & {
  id: string;
  registrationName: string;
};

const STORAGE_KEY = "kaito-site-seiseikun:characters:v1";

function isSavedCharacter(value: unknown): value is SavedCharacter {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "imageUrl" in value &&
    typeof value.imageUrl === "string" &&
    "characterName" in value &&
    typeof value.characterName === "string" &&
    "registrationName" in value &&
    typeof value.registrationName === "string"
  );
}

export function loadCharacters(): SavedCharacter[] {
  let raw: string | null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error("キャラクター情報を読み込めませんでした。");
  }

  if (raw === null) return [];

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("保存されているキャラクター情報の形式が不正です。");
  }

  if (!Array.isArray(parsed) || !parsed.every(isSavedCharacter)) {
    throw new Error("保存されているキャラクター情報の形式が不正です。");
  }

  return parsed;
}

function writeCharacters(characters: SavedCharacter[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  } catch {
    throw new Error("キャラクター情報を保存できませんでした。");
  }
}

export function hasDuplicateCharacter(
  characters: readonly SavedCharacter[],
  draft: CharacterDraft,
): boolean {
  return characters.some(
    (character) =>
      character.imageUrl === draft.imageUrl &&
      character.characterName === draft.characterName,
  );
}

export function registerCharacter(
  draft: CharacterDraft,
  registrationName: string,
): SavedCharacter {
  if (draft.imageUrl.trim() === "" || draft.characterName.trim() === "") {
    throw new Error("画像URLとキャラクター名を入力してください。");
  }

  if (registrationName.trim() === "") {
    throw new Error("登録名は必須項目です");
  }

  // 保存直前に、最新の保存内容で再確認します。
  const characters = loadCharacters();

  if (hasDuplicateCharacter(characters, draft)) {
    throw new Error(
      "既に同じ画像URL・キャラクター名の組み合わせでデータ登録が存在します",
    );
  }

  const character: SavedCharacter = {
    id: crypto.randomUUID(),
    imageUrl: draft.imageUrl,
    characterName: draft.characterName,
    registrationName: registrationName.trim(),
  };

  writeCharacters([...characters, character]);

  return character;
}

export function deleteCharacter(id: string): SavedCharacter[] {
  const characters = loadCharacters();
  const remaining = characters.filter((character) => character.id !== id);

  writeCharacters(remaining);

  return remaining;
}

/** 最新の登録一覧にある画像URLを一括置換する。登録名・IDは統合せず保持する。 */
export function replaceCharacterImageUrls(before: string, after: string): void {
  const characters = loadCharacters();
  if (!characters.some((character) => character.imageUrl === before)) return;
  writeCharacters(characters.map((character) => character.imageUrl === before ? { ...character, imageUrl: after } : character));
}
