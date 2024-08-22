'use client';
import { create } from 'zustand'
import React from "react";
import {IUser} from "@/app/models";

type RightDrawerState = {
    rightDrawerIsOpen: boolean,
    rightDrawerTitle:  React.ReactNode | string,
    rightDrawerContent:  React.ReactNode | string,
    setRightDrawer: (isOpen: boolean, title: React.ReactNode | string, content: React.ReactNode | string) => void,
    closeRightDrawer: () => void,
    openRightDrawer: (title: React.ReactNode | string, content: React.ReactNode | string) => void,
    clearRightDrawer: () => void,
}
export const useRightDrawerStore = create<RightDrawerState>((set) => ({
    rightDrawerIsOpen: false,
    rightDrawerTitle: '',
    rightDrawerContent: null,
    setRightDrawer: (isOpen: boolean, title: React.ReactNode | string, content: React.ReactNode | string) => set({ rightDrawerIsOpen: isOpen, rightDrawerTitle: title, rightDrawerContent: content }),
    closeRightDrawer: () => set({ rightDrawerIsOpen: false }),
    openRightDrawer: (title, content) => set({ rightDrawerIsOpen: true, rightDrawerTitle: title, rightDrawerContent: content }),
    clearRightDrawer: () => set({ rightDrawerIsOpen: false, rightDrawerTitle: '', rightDrawerContent: null }),
}))

type UserSessionState = {
    user: IUser | null,
    fullUser: IUser | null,
    setUser: (user: IUser) => void,
    setFullUser: (user: IUser) => void,
    clearUser: () => void,
}
export const userSessionState = create<UserSessionState>((set) => ({
    user: null,
    fullUser: null,
    setUser: (user: IUser) => set({ user }),
    setFullUser: (fullUser: IUser) => set({ fullUser }),
    clearUser: () => set({ user: null }),
}))

export default useRightDrawerStore;