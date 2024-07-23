'use server';
import {verifySession} from "@/app/lib/session"
import {getWorkspaces} from "@/app/actions/workspaceActions";

export async function getUser() {
    const session = await verifySession();
    const user = session.user;
    if(user){
        user.workspaces = await getWorkspaces(session.user.id);
    }
    return user;
}