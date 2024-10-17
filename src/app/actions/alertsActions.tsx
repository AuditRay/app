'use server'
import {IAlert, Alert, Website, IWebsiteInfo, WebsiteInfo, IWebsite, UpdateInfo} from "@/app/models";
import {getUser} from "@/app/actions/getUser";
import {IWebsiteTable} from "@/app/actions/websiteActions";
import {connectMongo} from "@/app/lib/database";
import {GridFilterModel} from "@mui/x-data-grid-pro";
import {filterWebsiteTable} from "@/app/lib/utils";
import {AlertInfo, IAlertInfo} from "@/app/models/AlertInfo";

const versionTypeMapping = {
    NOT_CURRENT: 'Needs Update',
    CURRENT: 'Up to Date',
    NOT_SECURE: 'Security Update',
    REVOKED: 'Revoked',
    UNKNOWN: 'Unknown',
    NOT_SUPPORTED: 'Not Supported',
}

export async function getAlertInfo(): Promise<IAlertInfo[]> {
    await connectMongo();
    const user = await getUser();
    if (!user) {
        throw new Error('User not found');
    }
    const alerts = await AlertInfo.find({}, {
        workspace: 1, user: 1, alert: 1, subject:1, text: 1, isSeen: 1, isOpened: 1
    });
    return alerts.map((alert) => alert.toJSON());
}

export async function getAlertWebsites(
    workspaceId?: string,
    userId?: string,
    filters: GridFilterModel = { items: [] }
): Promise<{
    data: IWebsiteTable[];
    count: number;
    extraHeaders: { id: string, label: string }[];
}> {
    await connectMongo();
    console.log('getWebsitesTable');

    console.time('getWebsitesTable');
    let websites = [];
    if (!workspaceId) {
        websites = await Website.find({user: userId, workspace: null});
    } else {
        websites = await Website.find({
            workspace: workspaceId
        });
    }
    const websitesData: IWebsiteTable[] = [];
    const extraHeaders: { id: string, label: string, type?: string }[] = [
        {id: 'frameworkVersion', label: 'Framework'},
    ];
    const websiteInfos: Record<string, IWebsiteInfo> = {};
    for (const website of websites) {
        const websiteInfo = await WebsiteInfo.find({website: website._id}).sort({createdAt: -1}).limit(1);

        if (websiteInfo[0]) {
            websiteInfos[website._id.toString()] = websiteInfo[0];
        }
        if (websiteInfo[0]?.websiteComponentsInfo) {
            for (const component of websiteInfo[0].websiteComponentsInfo) {
                if (!extraHeaders.find((header) => header.id === component.name)) {
                    extraHeaders.push({id: component.name, label: component.title, type: 'component'});
                }
            }
        }

        if (websiteInfo[0]?.dataSourcesInfo) {
            for (const component of websiteInfo[0].dataSourcesInfo) {
                if(component.id === 'monit_phpinfo') {
                    continue;
                }
                if (component.data) {
                    for (const data of component.data) {
                        if (!extraHeaders.find((header) => header.id === data.id)) {
                            extraHeaders.push({id: data.id, label: `${component.label} - ${data.label}`});
                        }
                    }
                }
            }
        }
    }
    console.timeEnd('getWebsitesTable');
    console.time('process websitesTable');
    for (const website of websites) {
        const websiteObj: IWebsite = website.toJSON();
        const websiteInfo = websiteInfos[websiteObj.id.toString()];
        const components: UpdateInfo[] =  (websiteInfo?.websiteComponentsInfo || []).map((component) => {
            return {
                ...component,
                available_releases: []
            }
        });
        const componentsUpdated = components.filter((component) => component.type === 'CURRENT') || [];
        const componentsWithUpdates = components.filter((component) => component.type === 'NOT_CURRENT') || [];
        const componentsWithSecurityUpdates = components.filter((component) => component.type === 'NOT_SECURE') || [];
        const frameWorkUpdateStatus = websiteInfo?.frameworkInfo.type || "UNKNOWN";
        let status: IWebsiteTable['frameWorkUpdateStatus'] = "Up to Date";
        if (componentsWithUpdates?.length || frameWorkUpdateStatus === "NOT_CURRENT") {
            status = "Needs Update";
        }
        if (componentsWithSecurityUpdates?.length || frameWorkUpdateStatus === "NOT_SECURE") {
            status = "Security Update";
        }
        if (frameWorkUpdateStatus === "REVOKED") {
            status = "Revoked";
        }
        if (frameWorkUpdateStatus === "UNKNOWN") {
            status = "Unknown";
        }
        if (frameWorkUpdateStatus === "NOT_SUPPORTED") {
            status = "Not Supported";
        }
        const siteData: IWebsiteTable = {
            ...{
                ...websiteObj,
                metadata: undefined,
            },
            siteName: websiteObj.title ? websiteObj.title : websiteObj.url,
            types: websiteObj.type ? [websiteObj.type.name, ...(websiteObj.type.subTypes.map((subType) => subType.name))] : [],
            tags: websiteObj.tags,
            components,
            componentsNumber:  components.length,
            componentsUpdated,
            componentsUpdatedNumber:  componentsUpdated.length,
            componentsWithUpdates,
            componentsWithUpdatesNumber:  componentsWithUpdates.length,
            componentsWithSecurityUpdates,
            componentsWithSecurityUpdatesNumber: componentsWithSecurityUpdates.length,
            frameWorkUpdateStatus: status
        }
        if (websiteInfo?.frameworkInfo) {
            siteData.frameworkVersion = {
                type: "version",
                status: versionTypeMapping[websiteInfo.frameworkInfo?.type] || 'Unknown',
                value: websiteInfo.frameworkInfo.current_version || 'N/A',
                component: {
                    ...websiteInfo.frameworkInfo,
                    available_releases: []
                },
            }
        }
        if (websiteInfo?.websiteComponentsInfo) {
            for (const header of extraHeaders) {
                const component = components.find((component) => component.name === header.id);
                if (!component) continue;
                siteData[header.id] = {
                    type: "version",
                    status: versionTypeMapping[component?.type] || 'Unknown',
                    value: component?.current_version || 'N/A',
                    component: component,
                };
            }
        }
        if (websiteInfo?.dataSourcesInfo) {
            for (const dataSource of websiteInfo.dataSourcesInfo) {
                if (dataSource.id === 'monit_phpinfo') {
                    continue;
                }
                if (dataSource.data) {
                    for (const header of extraHeaders) {
                        const data = dataSource.data.find((data) => data.id === header.id);
                        if(data?.detailsFindings) {
                            data.detailsFindings = data.detailsFindings.map((finding) => {
                                if(finding.items) {
                                    delete finding.items;
                                }
                                return finding;
                            });
                        }
                        if (data?.status) {
                            siteData[header.id] = {
                                type: "status",
                                status: data.status,
                                value: data.status === 'success' ? "Success" : data.status === 'warning' ? "Warning" : "Error",
                                raw: data,
                                url: websiteObj.url,
                            };
                            if (data?.detailsFindings) {
                                siteData[header.id]['info'] = data.detailsFindings.map((finding) => finding.value).join(' ');
                            }
                        } else if (data?.detailsFindings) {
                            siteData[header.id] = {
                                type: "text",
                                value: data.detailsFindings.map((finding) => finding.value).join(' '),
                                raw: data,
                                url: websiteObj.url,
                            };
                        }
                    }
                }
            }
        }

        for (const header of extraHeaders) {
            if (!siteData[header.id]) {
                siteData[header.id] = {
                    type: "text",
                    value: 'N/A',
                }
            }
        }
        websitesData.push(siteData);
    }


    if(filters.items.length) {
        console.log('filters.items', filters, filters.items);
        const filteredData = websitesData.filter((website) => {
            return filterWebsiteTable(website, filters);
        });
        console.log('filteredData', filteredData.length);
        websitesData.length = 0;
        websitesData.push(...filteredData);
    }
    console.timeEnd('process websitesTable');

    return {
        data: websitesData,
        count: websitesData.length,
        extraHeaders: extraHeaders
    };
}

export async function createAlert(alertData: Partial<IAlert>) {
    await connectMongo();
    const user = await getUser();

    const alert = new Alert({
        workspace: user.currentSelectedWorkspace || null,
        user: user.id,
        title: alertData.title,
        enabled: alertData.enabled,
        interval: alertData.interval,
        intervalUnit: alertData.intervalUnit,
        filters: alertData.filters,
        notifyUsers: alertData.notifyUsers,
    });

    const savedAlert = await alert.save();
    return {
        data: savedAlert.toJSON()
    }
}

export async function getWorkspaceAllAlerts(): Promise<IAlert[]> {
    await connectMongo();
    const user = await getUser();

    let alerts;
    if(!user.currentSelectedWorkspace) {
        alerts = await Alert.find({workspace: user.currentSelectedWorkspace});
    } else {
        alerts = await Alert.find({user: user.id});
    }
    return alerts.map((a) => a.toJSON());
}

export async function deleteAlert(alertId: string) {
    await connectMongo();
    const user = await getUser();
    await Alert.deleteOne({_id: alertId});
}

export async function updateAlert(alertId: string, alertData: Partial<IAlert>) {
    await connectMongo();
    const user = await getUser();
    const alert = await Alert.findOne({_id: alertId});
    if (!alert) {
        throw new Error('Alert not found');
    }

    alert.set({
        title: alertData.title,
        enabled: alertData.enabled,
        filters: alertData.filters,
        notifyUsers: alertData.notifyUsers,
        interval: alertData.interval,
        intervalUnit: alertData.intervalUnit,
        events: alertData.events
    });

    alert.markModified('title');
    alert.markModified('enabled');
    alert.markModified('rules');
    alert.markModified('interval');
    alert.markModified('intervalUnit');
    alert.markModified('notifyUsers');
    alert.markModified('filters');
    alert.markModified('events');
    const savedAlert = await alert.save();
    return {
        data: savedAlert.toJSON()
    }
}

export async function getAlert(alertId: string): Promise<IAlert> {
    await connectMongo();
    const user = await getUser();
    const alert = await Alert.findOne({_id: alertId});
    if(!alert) {
        throw new Error('Role not found');
    }
    return alert.toJSON();
}

