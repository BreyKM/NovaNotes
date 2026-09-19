import { describe, expect, it } from "vitest";
import {
  PICKABLE_LANGUAGES,
  fenceLanguageChange,
  languageId,
  languageOptions,
  resolveLanguage,
} from "./codeLanguages";
import { language } from "@codemirror/language";

describe("resolveLanguage", () => {
  it.each([
    ["python", "Python"],
    ["py", "Python"],
    ["js", "JavaScript"],
    ["yml", "YAML"],
    ["py title=example", "Python"],
  ])("resolves %j to %s", (info, name) => {
    expect(resolveLanguage(info)?.name).toBe(name);
  });

  it.each(["", "   ", "mermaid"])("resolves %j to nothing", (info) => {
    expect(resolveLanguage(info)).toBeNull();
  });
});

describe("PICKABLE_LANGUAGES", () => {
  it("only offers languages whose id resolves back to them", () => {
    const broken = PICKABLE_LANGUAGES.filter(
      (language) => resolveLanguage(languageId(language)) !== language,
    );
    expect(broken).toEqual([]);
  });

  it("never offers an id containing whitespace", () => {
    expect(
      PICKABLE_LANGUAGES.map(languageId).filter((id) => /\s/.test(id)),
    ).toEqual([]);
  });
});

describe("languageOptions", () => {
  const selected = (info: string) =>
    languageOptions(info)
      .filter((option) => option.selected)
      .map((option) => option.value);

  it("selects the canonical id for an alias", () => {
    expect(selected("py")).toEqual(["python"]);
  });

  it("selects plain text when there is no language", () => {
    expect(selected("")).toEqual([""]);
  });

  it("keeps an unknown language as its own selected option", () => {
    const options = languageOptions("mermaid");
    expect(options[1]).toEqual({
      value: "mermaid",
      label: "mermaid",
      selected: true,
    });
    expect(selected("mermaid")).toEqual(["mermaid"]);
  });
});

describe("fenceLanguageChange", () => {
  it.each([
    ["```py", 0, "rust", { from: 3, to: 5, insert: "rust" }],
    ["```", 10, "go", { from: 13, to: 13, insert: "go" }],
    ["~~~ js title=x", 0, "ts", { from: 4, to: 6, insert: "ts" }],
    ["```py", 0, "", { from: 3, to: 5, insert: "" }],
  ])("rewrites %j", (line, lineFrom, id, expected) => {
    expect(fenceLanguageChange(line, lineFrom, id)).toEqual(expected);
  });

  it("ignores a line that is not a fence", () => {
    expect(fenceLanguageChange("plain text", 0, "py")).toBeNull();
  });
});

describe("languageId", () => {
  it.each([
    ["JavaScript", "javascript"],
    ["TypeScript", "typescript"],
    ["JSON", "json"],
    ["HTML", "html"],
    ["YAML", "yaml"],
    ["Python", "python"],
    ["C++", "c++"],
  ])("writes %s as %j", (name, id) => {
    const language = PICKABLE_LANGUAGES.find((l) => l.name === name);
    expect(language && languageId(language)).toBe(id);
  });
});
