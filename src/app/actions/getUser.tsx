import { verifySession } from "@/app/lib/session"

export async function getUser() {
    const session = await verifySession();
    return session.user;
}