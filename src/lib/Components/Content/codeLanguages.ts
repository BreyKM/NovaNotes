import { language, LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import type { ChangeSpec } from "@codemirror/state";

const WHITESPACE = /\s/;
const FENCE = /^( {0,3}(?:`{3,}|~{3,})[ \t]*)(\S*)/;

export function resolveLanguage(info: string): LanguageDescription | null {
  const word = info.trim().split(WHITESPACE)[0];
  if (!word) {
    return null;
  }
  return (
    LanguageDescription.matchLanguageName(languages, word, true) ??
    LanguageDescription.matchFilename(languages, `file.${word}`)
  );
}

export function languageId(language: LanguageDescription): string {
  const lower = language.name.toLocaleLowerCase();
  if (!language.alias.includes(lower) && !WHITESPACE.test(lower)) {
    return lower;
  }
  return (
    language.alias.find((alias) => !WHITESPACE.test(alias)) ??
    lower.replace(/\s+/g, "-")
  );
}

export const PICKABLE_LANGUAGES = languages
  .filter((language) => resolveLanguage(languageId(language)) === language)
  .sort((a, b) => a.name.localeCompare(b.name));

export interface LanguageOption {
  value: string;
  label: string;
  selected: boolean;
}

export function languageOptions(info: string): LanguageOption[] {
  const word = info.trim().split(WHITESPACE)[0] ?? "";
  const current = resolveLanguage(word);
  const currentId = current ? languageId(current) : null;

  const options: LanguageOption[] = [
    { value: "", label: "Plain text", selected: word === "" },
  ];

  if (word !== "" && (!current || !PICKABLE_LANGUAGES.includes(current))) {
    options.push({ value: word, label: word, selected: true });
  }

  for (const language of PICKABLE_LANGUAGES) {
    const value = languageId(language);
    options.push({
      value,
      label: language.name,
      selected: value === currentId,
    });
  }

  return options;
}

export function fenceLanguageChange(
  lineText: string,
  lineFrom: number,
  id: string,
): ChangeSpec | null {
  const match = FENCE.exec(lineText);
  if (!match) {
    return null;
  }
  const from = lineFrom + match[1].length;
  return { from, to: from + match[2].length, insert: id };
}
