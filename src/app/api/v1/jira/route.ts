import {NextRequest} from "next/server";
import {Workspace} from "@/app/models";
import {connectMongo} from "@/app/lib/database";

export async function GET(request: NextRequest) {
    await connectMongo();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    console.log('data', searchParams);
    //get token from https://auth.atlassian.com/oauth/token
    const rawResponse =  await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "grant_type": "authorization_code",
            "client_id": "O7gNWsjkktg2YsCjQAFysD3ZZF5yH3aq",
            "client_secret": "ATOApFPc4FfNrEt36ecK7VONa7Js5gB4FghLiBJiVFsB6UCyfXn2JVmai2L2iQtFLfrk9496313A",
            "code": code,
            "redirect_uri": "https://local.monit.dev/api/v1/jira"
        })
    })
    const response: {
        access_token: string;
        expires_in: number;
        scope: string;
        refresh_token: string;
    } = await rawResponse.json();
    const workspace = await Workspace.findOne({_id: state});
    if(workspace) {
        console.log('response', response);
        if(!workspace.jira) {
            workspace.jira = {
                status: false,
                token: '',
                refreshToken: ''
            }
        }
        workspace.jira.token = response.access_token;
        workspace.jira.refreshToken = response.refresh_token
        workspace.jira.status = true;
        workspace.markModified('jira');
        await workspace.save();
        return Response.redirect(`https://monit.waleedq.dev/workspace/${workspace.id}/settings/integrations`);
    }
    return Response.redirect(`https://monit.waleedq.dev/dashboard`);
}