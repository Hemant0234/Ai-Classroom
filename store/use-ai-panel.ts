import { create } from "zustand";

interface IAiPanel {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    toggle: () => void;
}

export const useAiPanel = create<IAiPanel>((set) => ({
    isOpen: false, // Default to closed so it doesn't block
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
