'use server'

import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {v4 as uuid4} from "uuid";
import {IMemberPopulated, IRole, IUser, IWorkspace, IWorkspacePopulated, jiraType, User, Workspace} from "@/app/models";
import {sendEmail} from "@/app/lib/email";
import {getWorkspaceRoles} from "@/app/actions/rolesActions";
import {connectMongo} from "@/app/lib/database";
import {convertHtmlToSchema} from "@/app/lib/utils";
import {getWebsitesTable, WebsiteStatistics} from "@/app/actions/websiteActions";
import {IAlertInfo} from "@/app/models/AlertInfo";
import {getAlertInfo} from "@/app/actions/alertsActions";

export type workspaceDashboardReturn = {
    workspace: IWorkspace;
    statistics: WebsiteStatistics;
    alerts: IAlertInfo[];
};
export async function getWorkspacesDashboard(): Promise<workspaceDashboardReturn[]> {
    await connectMongo();
    console.log('getWorkspacesDashboard');
    const user = await getUser();
    const workspaces = await Workspace.find({$or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]});
    const workspacesData: {
        workspace: IWorkspace;
        statistics: WebsiteStatistics;
        alerts: IAlertInfo[];
    }[] = [];
    for (const workspace of workspaces) {
        const websiteTableData = await getWebsitesTable(workspace.id)
        const alertInfo = await getAlertInfo(workspace.id);
        workspacesData.push({
            workspace: workspace.toJSON(),
            statistics: websiteTableData.statistics,
            alerts: alertInfo.slice(0, 5)
        })
    }

    return workspacesData;
}

export async function setCurrentSelectedWorkspace(workspaceId?: string): Promise<IUser> {
    await connectMongo();
    console.log('setCurrentSelectedWorkspace');
    const user = await getUser();
    if (!workspaceId) {
        await User.updateOne({_id: user.id}, {currentSelectedWorkspace: null});
        user.currentSelectedWorkspace = '';
        return user;
    }
    const workspace = await Workspace.findOne({_id: workspaceId, $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]});
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    await User.updateOne({_id: user.id}, {currentSelectedWorkspace: workspaceId});
    user.currentSelectedWorkspace = workspaceId;
    return user;
}

export async function getWorkspaces(userId?: string): Promise<IWorkspace[]> {
    await connectMongo();
    console.log('getWorkspaces');
    if(!userId) {
        const user = await getUser();
        userId = user.id;
    }
    const workspaces = await Workspace.find({$or: [{owner: userId}, {users: userId}, {"members.user": userId}]});
    return workspaces.map(workspace => workspace.toJSON());
}

export async function getWorkspace(workspaceId?: string): Promise<IWorkspace> {
    await connectMongo();
    console.log('getWorkspace');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    return workspace.toJSON();
}

export async function updateJiraConfig(workspaceId: string, config: jiraType['config']): Promise<IWorkspace['jira']> {
    await connectMongo();
    console.log('updateJiraConfig');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    if(!workspace.jira) {
        workspace.jira = {
            config: {
                hiddenFields: ''
            }
        }
    }
    if(!workspace.jira?.config) {
        workspace.jira.config =  {
            hiddenFields: config?.hiddenFields || ''
        };
    } else {
        workspace.jira.config.hiddenFields = config?.hiddenFields || '';
    }
    if(!workspace.jira?.config.hiddenFields) {
        workspace.jira.config.hiddenFields = '';
    }

    workspace.markModified('jira');
    await workspace.save();
    return workspace.jira;
}

export async function disconnectJiraToken(workspaceId: string): Promise<IWorkspace['jira']> {
    await connectMongo();
    console.log('disconnectJiraToken');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    workspace.jira = undefined;
    workspace.markModified('jira');
    await workspace.save();
    return workspace.jira;
}

export async function updateJiraToken(workspaceId: string): Promise<IWorkspace['jira'] | null> {
    await connectMongo();
    console.log('updateJiraToken');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    if(workspace.jira) {
        const rawResponse =  await fetch('https://auth.atlassian.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "grant_type": "refresh_token",
                "client_id": "O7gNWsjkktg2YsCjQAFysD3ZZF5yH3aq",
                "client_secret": "ATOApFPc4FfNrEt36ecK7VONa7Js5gB4FghLiBJiVFsB6UCyfXn2JVmai2L2iQtFLfrk9496313A",
                "refresh_token": workspace.jira.refreshToken,
            })
        })
        const response: {
            access_token: string;
            expires_in: number;
            scope: string;
            refresh_token: string;
        } = await rawResponse.json();
        workspace.jira.token = response.access_token;
        workspace.jira.refreshToken = response.refresh_token
        workspace.jira.status = true;
        workspace.markModified('jira');
        await workspace.save();
    }
    return workspace.jira?.token ? workspace.jira : null;
}

export async function getJiraResources(currentWorkspaceId: string): Promise<any> {
    await connectMongo();
    const updateToken = await updateJiraToken(currentWorkspaceId);
    if(!updateToken){
        return {};
    }
    const rawResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    return await rawResponse.json();
}

export async function getJiraProjects(currentWorkspaceId: string, jiraResourceId: string): Promise<any> {
    await connectMongo();
    console.log('getJiraProjects');
    const projects = [];
    const updateToken = await updateJiraToken(currentWorkspaceId);
    if(!updateToken){
        throw new Error('Jira not connected');
    }
    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/project/search`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    let response = await rawResponse.json();
    if (response.values?.length > 0) {
        projects.push(...response.values);
        while (response.nextPage) {
            const rawResponse = await fetch(response.nextPage, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${updateToken.token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })

            response = await rawResponse.json();
            if (response.values?.length > 0) {
                projects.push(...response.values);
            }
            if(!response.nextPage) {
                break;
            }
        }
    }
    return projects || [];
}

export async function getJiraUsers(currentWorkspaceId: string, jiraResourceId: string, jiraProjectId: string): Promise<any> {
    await connectMongo();
    console.log('getJiraUsers');
    const updateToken = await updateJiraToken(currentWorkspaceId);
    if(!updateToken){
        throw new Error('Jira not connected');
    }
    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/groupuserpicker?query=*&projectId=${jiraProjectId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    const response: {
        users?: {
            users: {
              accountId: string;
              accountType: string;
              html: string;
              displayName: string;
            }[];
            total: number;
            header: string;
        }
    } = await rawResponse.json();
    return response.users?.users.filter(user => user.accountType === 'atlassian') || [];
}

export type jiraIssueType = {
    id: string;
    iconUrl: string;
    name: string;
    subtask: boolean;
};
export async function getJiraIssues(currentWorkspaceId: string, jiraResourceId: string, projectId: string): Promise<any> {
    await connectMongo();
    console.log('getJiraIssues');
    const updateToken = await updateJiraToken(currentWorkspaceId);
    if(!updateToken){
        throw new Error('Jira not connected');
    }
    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/issuetype/project?projectId=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    const response: jiraIssueType[] = await rawResponse.json();
    return (response || []).filter(issue => !issue.subtask);
}

export type jiraIssueFields = {
    startAt: string;
    maxResults: string;
    total: string;
    nextPage: string;
    fields: any[]
};
export async function getJiraIssueFields(currentWorkspaceId: string, jiraResourceId: string, jiraProjectId: string, jiraIssueId: string): Promise<any> {
    await connectMongo();
    const fields = [];
    console.log('getJiraIssues');
    const updateToken = await updateJiraToken(currentWorkspaceId);
    if(!updateToken){
        throw new Error('Jira not connected');
    }
    const workspace = await Workspace.findOne({_id: currentWorkspaceId});
    if (!workspace?.jira) return [];
    const jiraConfig = workspace.jira.config || {
        hiddenFields: ''
    };
    const hiddenFields = jiraConfig.hiddenFields?.split('\n').map(field => field.trim()) || [];
    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/issue/createmeta/${jiraProjectId}/issuetypes/${jiraIssueId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    let response: jiraIssueFields = await rawResponse.json();
    if (response.fields?.length > 0) {
        fields.push(...response.fields);
        while (response.nextPage) {
            const rawResponse = await fetch(response.nextPage, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${updateToken.token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })

            response = await rawResponse.json();
            if (response.fields?.length > 0) {
                fields.push(...response.fields);
            }
            if(!response.nextPage) {
                break;
            }
        }
    }

    const skipField = [
        'issuelinks',
        'issuetype',
        'reporter',
        'labels',
        'attachment',
        'project'
    ]

    const JIRA_CUSTOM_FIELD_TYPES = {
        "select": "com.atlassian.jira.plugin.system.customfieldtypes:select",
        "textarea": "com.atlassian.jira.plugin.system.customfieldtypes:textarea",
        "multiuserpicker": "com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker",
        "tempo_account": "com.tempoplugin.tempo-accounts:accounts.customfield",
        "multicheckboxes": "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes",
    }

    let users: any[] = [];
    try {
        const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/groupuserpicker?query=*&projectId=${jiraProjectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${updateToken.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        const response: {
            users?: {
                users: {
                    accountId: string;
                    accountType: string;
                    html: string;
                    displayName: string;
                }[];
                total: number;
                header: string;
            }
        } = await rawResponse.json();
        users = response.users?.users.filter(user => user.accountType === 'atlassian') || [];
    } catch (e) {
        users = [];
    }

    const formattedFields = [];
    console.log('fields', JSON.stringify(fields, null, 2));
    for (const field of fields) {
        if (skipField.includes(field.schema.system)) continue;
        if (!field.required && hiddenFields.includes(field.fieldId)) continue;
        if (['worklog', 'attachment'].includes(field.schema.system)) continue;
        if (['timetracking'].includes(field.schema.type)) continue;

        if (["securitylevel", "priority"].includes(field.schema.type) && field.schema.custom == JIRA_CUSTOM_FIELD_TYPES['select']) {
            field.fieldType = "select";
            field.allowedValues = field.allowedValues || [];
            formattedFields.push(field);
        } else if (field.autoCompleteUrl && (field.schema.items == 'user' || field.schema.type == 'user')) {
            try {
                const rawResponse = await fetch(field.autoCompleteUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${updateToken.token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                field.fieldType = "select";
                const allowedValues = await rawResponse.json();
                if(Array.isArray(allowedValues)) {
                    field['allowedValues'] = allowedValues;
                } else {
                    field['allowedValues'] = users;
                }
                formattedFields.push(field);
                console.log('response autocomplete', field.fieldId, field.autoCompleteUrl, JSON.stringify(response, null, 2));
            } catch (e) {
                if(!field.required) continue;
                if(field.hasDefaultValue) continue;
                field.fieldType = "select";
                field['allowedValues'] = users;
                formattedFields.push(field);
            }
        } else if (field.schema.custom == JIRA_CUSTOM_FIELD_TYPES['multicheckboxes']) {
            field.fieldType = "select";
            field.multiple = true;
            field.allowedValues = field.allowedValues || [];
            formattedFields.push(field);
        } else if (field.schema.type == 'array' && field.schema.items != 'string' && field.allowedValues) {
            field.fieldType = "select";
            field.allowedValues = field.allowedValues || [];
            formattedFields.push(field);
        } else if (field.schema.system == 'description') {
            field.fieldType = "description";
            formattedFields.push(field);
        } else if (field.schema.system == 'summary') {
            field.fieldType = "summary";
            formattedFields.push(field);
        } else if (field.schema.type == 'string') {
            field.fieldType = "text";
            formattedFields.push(field);
        } else if (field.schema.type == 'number') {
            field.fieldType = "number";
            formattedFields.push(field);
        } else if (field.schema.type == 'date') {
            field.fieldType = "date";
            formattedFields.push(field);
        } else if (field.schema.custom == JIRA_CUSTOM_FIELD_TYPES['textarea']) {
            field.fieldType = "textarea";
            formattedFields.push(field);
        }
    }
    console.log('response', JSON.stringify(fields, null, 2));
    return formattedFields || [];
}


export async function createJiraTicket(currentWorkspaceId: string, jiraResourceId: string, newTicketData: {
    project: string;
    issuetype: string;
    [key: string]: string;
}): Promise<any> {
    await connectMongo();
    console.log('createJiraTicket');
    const updateToken = await updateJiraToken(currentWorkspaceId);
    if(!updateToken){
        throw new Error('Jira not connected');
    }
    delete newTicketData.resource;
    const bodyData: any = {
      "fields": {
        ...newTicketData,
        "project": {
          "id": newTicketData.project
        }
      },
      "update": {}
    };

    if (newTicketData.description) {
        bodyData.fields.description = convertHtmlToSchema(newTicketData.description || '<p></p>');
    }
    if(newTicketData.assignee) {
        bodyData.fields.assignee = {
            "accountId": newTicketData.assignee
        }
    }
    if(newTicketData.issuetype) {
        bodyData.fields.issuetype = {
            "id": newTicketData.issuetype
        }
    }
    console.log('bodyData', JSON.stringify(bodyData, null, 2));
    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })

    const response = await rawResponse.json();
    console.log('response', JSON.stringify(response, null, 2));
    return response;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<IMemberPopulated[]> {
    await connectMongo();
    console.log('getWorkspaceMembers');
    const user = await getUser();
    if(!user) {
        throw new Error('User not found');
    }
    if(workspaceId == 'personal') {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }
    const workspace = await Workspace.findOne({_id: workspaceId});
    const roleData = await getWorkspaceRoles(workspaceId);
    const defaultMemberRole = roleData.find(role => role.id === 'default_member');
    if (workspace && workspace.members) {
        const workspaceOwner = (await User.findOne({_id: workspace.owner}))?.toJSON() || user;
        const members: IWorkspacePopulated['members'] = [{
            user: workspaceOwner,
            roles: [{
                id: 'owner',
                name: 'Owner',
                permissions: {},
                overrideId: "",
                workspace: workspaceId,
                isWorkspace: false
            }]
        }];
        for (const member of workspace.members) {
            const user = await User.findOne({_id: member.user});
            let roles: IRole[] = [];
            if(member.roles) {
                for (const role of member.roles) {
                    const roleObj = roleData.find(r => r.id === role);
                    if(roleObj) {
                        roles.push(roleObj);
                    } else if (defaultMemberRole) {
                        roles.push(defaultMemberRole)
                    }
                }
            }
            if (user) {
                members.push({
                    user: user.toJSON(),
                    roles: roles
                });
            }
        }

        return members;
    }
    return [];
}

export async function getWorkspaceUsers(workspaceId: string): Promise<IUser[]> {
    await connectMongo();
    console.log('getWorkspaceUsers');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (workspace) {
        const memberUsers = workspace.members?.map(member => member.user) || [];
        const users = await User.find({_id: {$in: [...memberUsers, workspace.owner]}});
        //map users to members and roles
        return users?.map(user => user.toJSON());
    }
    return [];
}

export async function removeUserFromWorkspace(workspaceId: string, userId: string): Promise<IWorkspace> {
    await connectMongo();
    console.log('removeUserFromWorkspace');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    console.log('userId', userId);
    workspace.members = workspace.members?.filter(member => member.user.toString() !== userId);
    workspace.markModified('members');
    await workspace.save();
    return workspace.toJSON();
}

export async function updateWorkspaceMemberRoles(workspaceId: string, userId: string, roles: string[]): Promise<IWorkspace> {
    await connectMongo();
    console.log('updateWorkspaceMemberRoles');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    const member = workspace.members?.find(member => member.user.toString() === userId);
    if(member) {
        member.roles = roles;
        workspace.markModified('members');
        await workspace.save();
    }
    return workspace.toJSON();
}

export async function inviteWorkspaceUser(workspaceId: string, userData: {firstName: string, lastName: string, email: string, role: string}): Promise<IUser> {
    await connectMongo();
    console.log('inviteWorkspaceUser');
    const user = await getUser();
    console.log('user', user);
    if(!workspaceId || workspaceId === 'personal') {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }
    const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    const checkUser = await User.findOne({email: userData.email});
    if (checkUser) {
        //check if user isn't already in workspace then add the user to workspace
        if (!workspace.members?.find(member => member.user.toString() === checkUser.id)) {
            if (!workspace.members) {
                workspace.members = [];
            }
            workspace.members.push({
                user: checkUser.id,
                roles: [userData.role]
            });
            workspace.markModified('members');
            await workspace.save();
        }
        //send email to user
        await sendEmail(
            checkUser.email,
            `You have been invited to ${workspace.name} workspace`,
            `
                <div>Hello ${checkUser.firstName} ${checkUser.lastName}</div>
                <div>You have been invited to <b>${workspace.name}</a> workspace</div>
                <div>Click on this link to open dashboard ${process.env.APP_URL}</div>
            `
        );
        return checkUser.toJSON();
    } else {
        const newUser = new User({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            currentSelectedWorkspace: user.currentSelectedWorkspace,
            inviteToken: uuid4(),
        });
        const savedUser = await newUser.save();
        if (!workspace.members) {
            workspace.members = [];
        }
        workspace.members.push({
            user: savedUser.id,
            roles: [userData.role]
        });
        workspace.markModified('members');
        await workspace.save();
        //send email to user
        await sendEmail(
            savedUser.email,
            `You have been invited to ${workspace.name} workspace`,
            `
                <div>Hello ${savedUser.firstName} ${savedUser.lastName}</div>
                <br/><br/>
                <div>You have been invited to <b>${workspace.name}</a> workspace</div>
                <div>Click on this link to join ${process.env.APP_URL}/join?inviteToken=${savedUser.inviteToken}</div>
            `
        );
        return savedUser.toJSON();
    }
}

export async function updateWorkspace(workspaceId: string, workspaceData: Partial<IWorkspace>) {
    await connectMongo();
    console.log('updateWorkspace');
    const user = await getUser();

    console.log('workspaceId', workspaceId, user.id);
    const workspace = await Workspace.findOne({ _id: workspaceId });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    workspace.set("name", workspaceData.name || workspace.name);
    workspace.set("timezone", workspaceData.timezone || workspace.timezone);
    const updatedWorkspace = await workspace.save();
    revalidatePath(`/`);
    return {
        data: updatedWorkspace.toJSON()
    }
}

export async function createWorkspace(workspaceData: Partial<IWorkspace>) {
    await connectMongo();
    console.log('createWorkspace');
    const user = await getUser();
    const workspace = new Workspace({
        name: workspaceData.name,
        owner: user.id,
        users: [user.id]
    });

    const savedWorkspace = await workspace.save();
    revalidatePath(`/`);
    return {
        data: savedWorkspace.toJSON()
    }
}