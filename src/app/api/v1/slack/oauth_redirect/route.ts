import {NextRequest, NextResponse} from "next/server";
import {connectMongo} from "@/app/lib/database";
import {IWorkspace, Workspace} from "@/app/models";
import { InstallProvider } from "@slack/oauth";
import {IncomingMessage, OutgoingMessage} from "node:http";
import { jwtDecode } from "jwt-decode";

const SLACK_ACCESS_TOKEN_URL = "https://slack.com/api/oauth.v2.access";

export async function GET(request: NextRequest) {
    await connectMongo();
    const url = request.nextUrl
    const code= url.searchParams.get('code');
    const state= url.searchParams.get('state');
    if(!code || !state) {
        return Response.redirect(`${process.env.APP_URL}/dashboard`);
    }
    try {
        const decodedState = jwtDecode<{
            installOptions: {
                scopes: string[];
                userScopes: string[];
                metadata: string;
                redirectUri: string;
            },
            now: string,
            random: number,
            iat: number,
        }>(state);
        const { redirectUri } = decodedState.installOptions;
        const { workspaceId } = JSON.parse(decodedState.installOptions.metadata);
        const workspace = await Workspace.findOne({_id: workspaceId});
        if(!workspace) {
            return Response.redirect(`${process.env.APP_URL}/dashboard`);
        }
        const rawResponse =  await fetch(SLACK_ACCESS_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.SLACK_CLIENT_ID!,
                client_secret: process.env.SLACK_CLIENT_SECRET!,
                grant_type: "authorization_code",
                redirectUri
            })
        })
        try {
            const response: IWorkspace['slack'] & { ok?: boolean } = await rawResponse.json();
            if (response.ok === true) {
                delete response.ok;
                workspace.slack = {
                    ...response,
                    error: '',
                    status: true,
                }
            } else {
                workspace.slack = {
                    access_token: '',
                    error: 'Error while connecting to slack',
                    status: false,
                }
            }

            console.log('workspace', workspace, response);
            await workspace.save();
            return Response.redirect(`${process.env.APP_URL}/workspace/${workspace.id}/settings/integrations`);
        } catch (e) {
            console.log('error', e);
            workspace.slack = {
                access_token: '',
                error: 'Error while connecting to slack',
                status: false,
            }
            await workspace.save();
        }
        return Response.redirect(`${process.env.APP_URL}/dashboard`);
    } catch (e) {
        console.log('error', e);
        return Response.redirect(`${process.env.APP_URL}/dashboard`);
    }
}