// src/stores/counter-store.ts
import { createStore } from 'zustand/vanilla'
import {IUser} from "@/app/models";

type UserStateState = {
    user: IUser | null,
    fullUser: IUser | null
}

type UserStateActions = {
    setUser: (user: IUser) => void,
    setFullUser: (user: IUser) => void,
    clearUser: () => void,
}
export type UserStateStore = UserStateState & UserStateActions

export const defaultInitState: UserStateState = {
    user: null,
    fullUser: null
}


export const createUserStore = (
    initState: UserStateState = defaultInitState,
) => {
    return createStore<UserStateStore>()((set) => ({
        ...initState,
        setUser: (user: IUser) => set({ user }),
        setFullUser: (fullUser: IUser) => set({ fullUser }),
        clearUser: () => set({ user: null, fullUser: null }),
    }))
}