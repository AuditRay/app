'use server';

import {IWorkspace, slackType, Workspace} from "@/app/models";
import {connectMongo} from "@/app/lib/database";
import {WebClient} from "@slack/web-api";
import {Channel} from "@slack/web-api/dist/types/response/ConversationsListResponse";

export async function sendSlackMessageChannels(workspaceId: string, channelId: string, message: string): Promise<void> {
    await connectMongo();
    console.log('getSlackChannels');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    console.log('workspace', workspace.slack);
    if(!workspace.slack || !workspace.slack.access_token) {
        return;
    }
    console.log('workspace.slack', workspace.slack);
    const webClient = new WebClient(workspace.slack.access_token);
    await webClient.chat.postMessage({
        channel: channelId,
        mrkdwn: true,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": message
                }
            }
        ]
    });
}

export async function getSlackChannels(workspaceId: string): Promise<Channel[]> {
    await connectMongo();
    console.log('getSlackChannels');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    console.log('workspace', workspace.slack);
    if(!workspace.slack || !workspace.slack.access_token) {
        return [];
    }
    console.log('workspace.slack', workspace.slack);
    const webClient = new WebClient(workspace.slack.access_token);
    const conversations = await webClient.conversations.list({types: 'public_channel,private_channel'});
    return conversations.channels || [];
}

export async function disconnectSlackToken(workspaceId: string): Promise<IWorkspace['slack']> {
    await connectMongo();
    console.log('disconnectSlackToken');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    workspace.slack = undefined;
    workspace.markModified('slack');
    await workspace.save();
    return workspace.slack;
}

export async function updateSlackConfig(workspaceId: string, config: slackType['config']): Promise<slackType> {
    await connectMongo();
    console.log('updateJiraConfig');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    if(!workspace.slack) {
        workspace.slack = {
            config: {
                hiddenFields: ''
            }
        }
    }
    if(!workspace.slack?.config) {
        workspace.slack.config =  {
            hiddenFields: config?.hiddenFields || ''
        };
    } else {
        workspace.slack.config.hiddenFields = config?.hiddenFields || '';
    }
    if(!workspace.slack?.config.hiddenFields) {
        workspace.slack.config.hiddenFields = '';
    }

    workspace.markModified('jira');
    await workspace.save();
    return workspace.slack;
}