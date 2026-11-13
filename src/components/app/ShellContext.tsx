import { createContext, useContext } from 'react';

export interface ShellContextValue {
  openCommandPalette: () => void;
  openNotifications: () => void;
}

export const ShellContext = createContext<ShellContextValue>({
  openCommandPalette: () => {},
  openNotifications: () => {},
});

/** Access shell-level overlays (command palette, notifications) from any page. */
export const useShell = () => useContext(ShellContext);
