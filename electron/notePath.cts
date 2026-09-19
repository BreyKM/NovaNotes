import path from "path";

const UNSAFE_CHARACTERS = /[<>:"/\\|?*\u0000-\u001F]/;

export function isSafeName(name: string): boolean {
  return name.trim() !== "" && !UNSAFE_CHARACTERS.test(name);
}

export function notePath(notebookDir: string, title: string): string {
  if (!isSafeName(title)) {
    throw new Error(`Invalid note name: ${JSON.stringify(title)}`);
  }
  return path.join(notebookDir, `${title}.md`);
}
