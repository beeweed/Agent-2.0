import type { StateCreator } from 'zustand';
import type { FileNode } from '../types';

export interface FilesSlice {
  fileTree: FileNode | null;
  selectedFilePath: string | null;
  fileContents: Record<string, string>;
  setFileTree: (tree: FileNode | null) => void;
  setSelectedFilePath: (path: string | null) => void;
  setFileContent: (path: string, content: string) => void;
}

export const createFilesSlice: StateCreator<FilesSlice, [], [], FilesSlice> = (set) => ({
  fileTree: null,
  selectedFilePath: null,
  fileContents: {},

  setFileTree: (fileTree) => set({ fileTree }),

  setSelectedFilePath: (selectedFilePath) => set({ selectedFilePath }),

  setFileContent: (path, content) =>
    set((state) => ({ fileContents: { ...state.fileContents, [path]: content } })),
});
