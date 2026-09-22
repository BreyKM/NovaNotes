export interface NoteMeta {
  title: string;
  creationTime: number;
  lastEditTime: number;
  id: string;
}

export interface NewNote {
  title: string;
  content: string;
}

export interface Tab {
  tabId: number;
  noteId: string | null;
  title: string;
}

export interface TabsState {
  tabs: Tab[];
  activeIndex: number;
}

export type CreateNotebookResult =
  | { ok: true; fullPath: string; name: string }
  | { ok: false; reason: "exists" | "invalid-name" };

export type NoteSort = "name" | "edited" | "created";

export interface LayoutState {
  sidebarWidth?: number;
  sidebarCollapsed?: boolean;
  noteSort?: NoteSort;
}
