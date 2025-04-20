// src/stores/counter-store.ts
import { createStore } from 'zustand/vanilla'
import {IRole, IUser} from "@/app/models";
import {getFullUser} from "@/app/actions/getUser";

type UserStateState = {
    sessionUser: IUser | null,
    sessionFullUser: IUser | null
    sessionUserWorkspaceRole: IRole | null,
}

type UserStateActions = {
    setSessionUserWorkspaceRole: (userWorkspaceRole: IRole) => void,
    setSessionUser: (user: IUser) => void,
    setSessionFullUser: (user: IUser) => void,
    clearUser: () => void,
    clearSessionUserWorkspaceRole: () => void,
    refreshSessionFullUser: () => Promise<void>
}
export type UserStateStore = UserStateState & UserStateActions

export const defaultInitState: UserStateState = {
    sessionUser: null,
    sessionFullUser: null,
    sessionUserWorkspaceRole: null
}


export const createUserStore = (
    initState: UserStateState = defaultInitState,
) => {
    return createStore<UserStateStore>()((set, get) => ({
        ...initState,
        setSessionUserWorkspaceRole: (userWorkspaceRole: IRole) =>  set({ sessionUserWorkspaceRole: userWorkspaceRole }),
        setSessionUser: (user: IUser) => set({ sessionUser: user }),
        setSessionFullUser: (fullUser: IUser) => set({ sessionFullUser: fullUser }),
        clearUser: () => set({ sessionUser: null, sessionFullUser: null }),
        clearSessionUserWorkspaceRole: () => set({ sessionUserWorkspaceRole: null }),
        refreshSessionFullUser: async () => {
            const sessionUser = get().sessionUser;
            if(sessionUser) {
                const fullUser = await getFullUser(sessionUser.id);
                set({ sessionFullUser: fullUser });
            }
        }
    }))
}