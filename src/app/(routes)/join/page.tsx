'use server'
import {redirect} from "next/navigation";
import {getUserByInviteToken} from "@/app/actions/auth";
import {InvalidInviteToken} from "@/app/ui/InvalidInviteToken";
import {JoinForm} from "@/app/ui/JoinForm";

export default async function Join({searchParams}: {searchParams: Record<string, string>}) {
    const inviteToken = searchParams['inviteToken'] || '';
    if(!inviteToken) {
        //return redirect('/login');
    }
    const user = await getUserByInviteToken(inviteToken);
    if(!user) {
        return (<InvalidInviteToken />)
    }
    return (<JoinForm user={user} />);
}
