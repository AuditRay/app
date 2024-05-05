'use client'


import {logout} from "@/app/actions/logout";
import {useEffect} from "react";

export default function Signup() {
    useEffect(() => {
        logout().then();
    }, []);
}