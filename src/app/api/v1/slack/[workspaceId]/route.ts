import { InstallProvider } from "@slack/oauth";
import {NextApiRequest, NextApiResponse} from "next";
import {NextRequest, NextResponse} from "next/server";

// initialize the installProvider
const installer = new InstallProvider({
    clientId: process.env.SLACK_CLIENT_ID!,
    clientSecret: process.env.SLACK_CLIENT_SECRET!,
    stateSecret: process.env.SLACK_STATE_SECRET,
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
    const workspaceId = (await params).workspaceId
    const url = await installer.generateInstallUrl({
        scopes: ['chat:write','channels:read', 'groups:read'],
        userScopes: ['channels:read'],
        metadata: JSON.stringify({ workspaceId }),
        redirectUri: `${process.env.APP_URL}/api/v1/slack/oauth_redirect`,
    });
    return Response.redirect(url);
}