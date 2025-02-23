// src/providers/counter-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type UserStateStore, createUserStore } from '@/stores/user-store'

export type UserStateStoreApi = ReturnType<typeof createUserStore>

export const UserStateStoreContext = createContext<UserStateStoreApi | undefined>(
    undefined,
)

export interface UserStateStoreProviderProps {
    children: ReactNode
}

export const UserStateStoreProvider = ({
                                         children,
                                     }: UserStateStoreProviderProps) => {
    const storeRef = useRef<UserStateStoreApi>(null)
    if (!storeRef.current) {
        // @ts-ignore
        storeRef.current = createUserStore()
    }

    return (
        <UserStateStoreContext.Provider value={storeRef.current}>
            {children}
        </UserStateStoreContext.Provider>
    )
}

export const useUserStateStore = <T,>(
    selector: (store: UserStateStore) => T,
): T => {
    const counterStoreContext = useContext(UserStateStoreContext)

    if (!counterStoreContext) {
        throw new Error(`useUserStateStore must be used within UserStateStoreProvider`)
    }

    return useStore(counterStoreContext, selector)
}