'use client'


import {logout} from "@/app/actions/logout";
import {useEffect} from "react";
import {userSessionState} from "@/app/lib/uiStore";

export default function Logout() {
    const clearUser = userSessionState((state) => state.clearUser);
    useEffect(() => {
        logout().then(() => {
            clearUser();
        });
    }, []);
}