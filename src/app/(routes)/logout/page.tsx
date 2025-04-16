'use client'


import {logout} from "@/app/actions/logout";
import {useEffect} from "react";
import {useUserStateStore} from "@/providers/user-store-provider";

export default function Logout() {
    const clearUser = useUserStateStore((state) => state.clearUser);
    useEffect(() => {
        logout().then(() => {
            clearUser();
        });
    }, []);
}