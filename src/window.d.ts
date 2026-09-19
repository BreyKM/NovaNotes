import type {
  NoteMeta,
  NewNote,
  Tab,
  TabsState,
  CreateNotebookResult,
} from "../shared/types";

declare global {
  interface Window {
    api: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
    };
    nav: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      onSaveBeforeClose: (callback: () => void) => void;
      readyToClose: () => void;
    };
    directory: {
      openRootDirSelection: () => void;
      getRootNotebookDirPath: () => Promise<string | undefined>;
      createNotebookDir: (
        name: string,
        parentDir: string,
      ) => Promise<CreateNotebookResult>;
    };
    main: {
      openMainWindow: () => void;
      getActiveFolder: () => Promise<string | undefined>;
      openLink: (url: string) => Promise<boolean>;
    };
    notes: {
      createWelcomeNote: (content: string) => Promise<void>;
      getNotes: () => Promise<NoteMeta[]>;
      createNote: (note: NewNote) => Promise<void>;
      readNote: (filename: string) => Promise<string>;
      writeNote: (filename: string, content: string) => Promise<void>;
      renameNote: (oldTitle: string, newTitle: string) => Promise<boolean>;
    };
    tab: {
      getTabs: () => Promise<TabsState>;
      updateTabs: (tabs: Tab[]) => Promise<void>;
      activeTabIndex: (index: number) => Promise<void>;
      loadNoteIntoActiveTab: (selectedNote: NoteMeta) => Promise<void>;
      createTab: () => void;
      createTabForNewNote: (note: NoteMeta) => Promise<void>;
      onTabsUpdated: (callback: (state: TabsState) => void) => () => void;
    };
  }
}

export {};
