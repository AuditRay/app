'use server'
import {deleteSession, verifySession} from "@/app/lib/session"
import {redirect} from "next/navigation";
import {connectMongo} from "@/app/lib/database";

export async function logout() {
    await connectMongo();
    console.log('logout');
    deleteSession()
    redirect('/login');
}