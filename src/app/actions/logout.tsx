'use server'
import {deleteSession, verifySession} from "@/app/lib/session"
import {redirect} from "next/navigation";

export async function logout() {
    deleteSession()
    redirect('/login');
}