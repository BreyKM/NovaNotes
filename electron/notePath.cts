import path from "path";

const UNSAFE_CHARACTERS = /[<>:"/\\|?*\u0000-\u001F]/;

export function notePath(notebookDir: string, title: string): string {
  if (title.trim() === "" || UNSAFE_CHARACTERS.test(title)) {
    throw new Error(`Invalid note name: ${JSON.stringify(title)}`);
  }
  return path.join(notebookDir, `${title}.md`);
}
