// store.ts
import { IUser } from '@/utils/types';
import { create } from 'zustand';

type UserStore = {
    user: IUser | null;
    setStoreUser: (user: IUser) => void;
};

const useStore = create<UserStore>((set) => ({
    user: null,
    setStoreUser: (user: IUser) => set({ user }),
}));

export default useStore;
