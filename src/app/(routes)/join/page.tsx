'use server'
import {redirect} from "next/navigation";
import {getUserByInviteToken} from "@/app/actions/auth";
import {InvalidInviteToken} from "@/app/ui/InvalidInviteToken";
import {JoinForm} from "@/app/ui/JoinForm";
import * as React from "react";

export default async function Join({searchParams}: {searchParams: Promise<Record<string, string>>}) {
    const searchParamsData = await searchParams;
    const inviteToken = searchParamsData['inviteToken'] || '';
    if(!inviteToken) {
        //return redirect('/login');
    }
    const user = await getUserByInviteToken(inviteToken);
    if(!user) {
        return (<InvalidInviteToken />)
    }
    return (<JoinForm user={user} />);
}
