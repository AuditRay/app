export const dynamic = 'force-dynamic';
import {NextRequest} from "next/server";
import {Alert, Team, User, Website, WebsiteInfo, Workspace} from "@/app/models";
import {connectMongo} from "@/app/lib/database";
import dayjs, {Dayjs, ManipulateType} from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {fetchUpdates, getWebsitesTable} from "@/app/actions/websiteActions";
import {getAlertWebsites} from "@/app/actions/alertsActions";
import {sendEmail} from "@/app/lib/email";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(request: NextRequest) {
    await connectMongo();
    const websites = await Website.find({});
    for (const website of websites) {
        const isSyncingEnabled = website.syncConfig?.enabled;
        if(isSyncingEnabled) {
            const syncConfig = website.syncConfig;
            const syncInterval = syncConfig?.syncInterval || 1;
            const intervalUnit = (syncConfig?.intervalUnit || 'Hour').toLowerCase() as ManipulateType;
            const syncTime = syncConfig?.syncTime;
            const websiteInfos = await WebsiteInfo.find({website: website._id}).sort({createdAt: -1}).limit(1);
            const latestWebsiteInfo = websiteInfos[0]
            const lastSync = latestWebsiteInfo?.createdAt;
            console.log('-----------------------------------------------------------------------');
            console.log('lastSync', dayjs(lastSync).format('YYYY-MM-DD HH:mm:ss'), website._id);
            if(website.workspace) {
                const workspace = await Workspace.findOne({_id: website.workspace});
                if (workspace) {
                    const timeZone = workspace.timezone;
                    if (timeZone) {
                        console.log('timeZone', timeZone);
                        let now = dayjs().tz(workspace.timezone);
                        const time = syncTime ? dayjs(syncTime).tz(workspace.timezone) : dayjs().tz(workspace.timezone).subtract(2, 'minute');
                        const lastSyncDate = lastSync ? dayjs(lastSync).tz(workspace.timezone) : now;
                        const lastSyncDateTime = lastSyncDate.set('hour', time.hour()).set('minute', time.minute()).set('second', time.second());
                        const nextSync = lastSyncDateTime.add(syncInterval, intervalUnit);
                        console.log('now', now.format('YYYY-MM-DD HH:mm:ss'), 'nextSyncTime', nextSync.format('YYYY-MM-DD HH:mm:ss'), "lastSync", lastSync);
                        now = dayjs().tz(workspace.timezone);
                        if (now.isAfter(nextSync)) {
                            await fetchUpdates(website.id, true);
                        }
                    } else {
                        console.log('timeZone', 'utc');
                        let now = dayjs().utc();
                        const time = syncTime ? dayjs(syncTime).utc() : dayjs().utc().subtract(2, 'minute');
                        const lastSyncDate = lastSync ? dayjs(lastSync).utc() : now;
                        const lastSyncDateTime = lastSyncDate.set('hour', time.hour()).set('minute', time.minute()).set('second', time.second());
                        const nextSync = lastSyncDateTime.add(syncInterval, intervalUnit);
                        console.log('now', now.format('YYYY-MM-DD HH:mm:ss'), 'nextSyncTime', nextSync.format('YYYY-MM-DD HH:mm:ss'), "lastSync", lastSync);
                        now = dayjs().utc();
                        if (now.isAfter(nextSync)) {
                            await fetchUpdates(website.id, true);
                        }
                    }
                }
            } else {
                console.log('no workspace');
                let now = dayjs().utc();
                const time = syncTime ? dayjs(syncTime).utc() : dayjs().utc().subtract(2, 'minute');
                const lastSyncDate = lastSync ? dayjs(lastSync).utc() : now;
                const lastSyncDateTime = lastSyncDate.set('hour', time.hour()).set('minute', time.minute()).set('second', time.second());
                const nextSync = lastSyncDateTime.add(syncInterval, intervalUnit)
                console.log("syncInterval", syncInterval, "intervalUnit", intervalUnit);
                console.log('now', now.format('YYYY-MM-DD HH:mm:ss'), 'nextSyncTime', nextSync.format('YYYY-MM-DD HH:mm:ss'), "lastSync", lastSync);
                now = dayjs().utc();
                if (now.isAfter(nextSync)) {
                    await fetchUpdates(website.id, true);
                }
            }
        }
    }
    const workspaces: string[] = [];
    const personalWorkspaces: string[] = [];
    for (const website of websites) {
        if (website.workspace) {
            if(!workspaces.includes(website.workspace.toString())) workspaces.push(website.workspace.toString());
        } else {
            if(!personalWorkspaces.includes(website.user.toString())) personalWorkspaces.push(website.user.toString());
        }
    }

    for (const workspaceId of workspaces) {
        const alerts = await Alert.find({workspace: workspaceId});
        for (const alert of alerts) {
            const filters = alert.filters;
            const alertWebsites = await getAlertWebsites(
                workspaceId,
                undefined,
                filters,
            );
            if(alertWebsites.count > 0) {
                const userIds = alert.notifyUsers.filter(user => user.includes('user:')).map(user => user.replace('user:', ''));
                const teamIds = alert.notifyUsers.filter(user => user.includes('team:')).map(user => user.replace('team:', ''));
                const teams = await Team.find({_id: {$in: teamIds}});
                for (const team of teams) {
                    if (team.members?.length) {
                        for (const member of team.members) {
                            if (!userIds.includes(member.user.toString())) userIds.push(member.user.toString());
                        }
                    }
                }
                //unique userIds
                const users = await User.find({_id: {$in: userIds}});
                for (const user of users) {
                    await sendEmail(
                        user.email,
                        `Alert: you have ${alertWebsites.count} websites matching you "${alert.title}" alert criteria`,
                        `
                            <div>Hello ${user.firstName} ${user.lastName},</div></br>
                            <div>The following website(s) matches your criteria for "${alert.title}" alert: </div>
                            <ul>
                                ${alertWebsites.data.map(website => "<li>" + website.title + "</li>").join('')}
                            </ul>
                            <div>Click on this link to open dashboard ${process.env.APP_URL}</div>
                        `
                    );
                }
                console.log('alertWebsites', alertWebsites.count);
            }
        }
    }
    for (const userId of personalWorkspaces) {
        const alerts = await Alert.find({user: userId, workspace: null});
        for (const alert of alerts) {
            const filters = alert.filters;
            const alertWebsites = await getAlertWebsites(
                undefined,
                userId,
                filters,
            );
            if(alertWebsites.count > 0) {
                const userIds = alert.notifyUsers.filter(user => user.includes('user:')).map(user => user.replace('user:', ''));
                const teamIds = alert.notifyUsers.filter(user => user.includes('team:')).map(user => user.replace('team:', ''));
                const teams = await Team.find({_id: {$in: teamIds}});
                for (const team of teams) {
                    if (team.members?.length) {
                        for (const member of team.members) {
                            if (!userIds.includes(member.user.toString())) userIds.push(member.user.toString());
                        }
                    }
                }
                //unique userIds
                const users = await User.find({_id: {$in: userIds}});
                for (const user of users) {
                    await sendEmail(
                        user.email,
                        `Alert: you have ${alertWebsites.count} websites matching you "${alert.title}" alert criteria`,
                        `
                            <div>Hello ${user.firstName} ${user.lastName}</div>
                            <div>The following website(s) matches your criteria for "${alert.title}" alert: </div>
                            <ul>
                                $(alertWebsites.data.map(website => "<li>" + website.title + "</li>").join(''))
                            </ul>
                            <div>Click on this link to open dashboard ${process.env.APP_URL}</div>
                        `
                    );
                }
                console.log('alertWebsites personalWorkspaces', alertWebsites.count);
            }
        }
    }
    return Response.json({status: "done", time: dayjs().format('YYYY-MM-DD HH:mm:ss')});
}