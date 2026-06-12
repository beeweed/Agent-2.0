// Re-export from the new slices-based state directory.
// Existing imports continue to work without changes.
export { useAppStore } from '../state';
export type { AppState, PersistedSettings } from '../state';
