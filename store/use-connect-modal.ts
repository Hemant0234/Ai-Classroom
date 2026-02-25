import { create } from "zustand";

interface IConnectModal {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useConnectModal = create<IConnectModal>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
