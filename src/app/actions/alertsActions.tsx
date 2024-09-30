'use server'
import {IAlert, Alert, User, Website, IWebsiteInfo, WebsiteInfo} from "@/app/models";
import {getUser} from "@/app/actions/getUser";
import {IWebsiteTable} from "@/app/actions/websiteActions";

const versionTypeMapping = {
    NOT_CURRENT: 'Needs Update',
    CURRENT: 'Up to Date',
    NOT_SECURE: 'Security Update',
    REVOKED: 'Revoked',
    UNKNOWN: 'Unknown',
    NOT_SUPPORTED: 'Not Supported',
}

export async function getAllFacts(userId?: string): Promise<{
    facts: { id: string, label: string }[];
}> {
    let user = await getUser();
    if(!userId) {
        userId = user.id;
    } else {
        user = await User.findOne({_id: userId}) || user;
    }
    console.log('user', user.currentSelectedWorkspace)
    console.time('getWebsitesTable');
    let websites = [];
    if(!user.currentSelectedWorkspace) {
        websites = await Website.find({user: userId});
    } else {
        websites = await Website.find({
            workspace: user.currentSelectedWorkspace
        });
    }
    const websitesData: IWebsiteTable[] = [];
    const extraHeaders: { id: string, label: string}[] = [
        {id: 'frameworkVersion', label: 'Framework'},
    ];
    const websiteInfos: Record<string, IWebsiteInfo> = {};
    for (const website of websites) {
        const websiteInfo = await WebsiteInfo.find({website: website._id}).sort({createdAt: -1}).limit(1);

        if(websiteInfo[0]){
            websiteInfos[website._id.toString()] = websiteInfo[0];
        }
        if(websiteInfo[0]?.websiteComponentsInfo) {
            for (const component of websiteInfo[0].websiteComponentsInfo) {
                if (!extraHeaders.find((header) => header.id === component.name)) {
                    extraHeaders.push({id: component.name, label: component.title});
                }
            }
        }

        if(websiteInfo[0]?.dataSourcesInfo) {
            for (const component of websiteInfo[0].dataSourcesInfo) {
                if(component.data) {
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
    for (const website of websites) {
        const websiteObj = website.toJSON();
        const websiteInfo = websiteInfos[websiteObj.id.toString()];
        const components = websiteInfo?.websiteComponentsInfo || [];
        const componentsUpdated = websiteInfo?.websiteComponentsInfo.filter((component) => component.type === 'CURRENT') || [];
        const componentsWithUpdates = websiteInfo?.websiteComponentsInfo.filter((component) => component.type === 'NOT_CURRENT') || [];
        const componentsWithSecurityUpdates = websiteInfo?.websiteComponentsInfo.filter((component) => component.type === 'NOT_SECURE') || [];
        const frameWorkUpdateStatus = websiteInfo?.frameworkInfo.type || "UNKNOWN";
        let status: IWebsiteTable['frameWorkUpdateStatus'] = "Up to Date";
        if(componentsWithUpdates?.length || frameWorkUpdateStatus === "NOT_CURRENT") {
            status = "Needs Update";
        }
        if(componentsWithSecurityUpdates?.length || frameWorkUpdateStatus === "NOT_SECURE") {
            status = "Security Update";
        }
        if(frameWorkUpdateStatus === "REVOKED") {
            status = "Revoked";
        }
        if(frameWorkUpdateStatus === "UNKNOWN") {
            status = "Unknown";
        }
        if(frameWorkUpdateStatus === "NOT_SUPPORTED") {
            status = "Not Supported";
        }
        const siteData: IWebsiteTable = {
            ...websiteObj,
            components,
            componentsUpdated,
            componentsWithUpdates,
            componentsWithSecurityUpdates,
            frameWorkUpdateStatus: status
        }
        if(websiteInfo?.frameworkInfo){
            siteData.frameworkVersion = {
                type: "version",
                status: versionTypeMapping[websiteInfo.frameworkInfo?.type] || 'Unknown',
                value: websiteInfo.frameworkInfo.current_version || 'N/A',
                component: websiteInfo.frameworkInfo,
            }
        }
        if(websiteInfo?.websiteComponentsInfo) {
            for (const header of extraHeaders) {
                const component = websiteInfo.websiteComponentsInfo.find((component) => component.name === header.id);
                if(!component) continue;
                siteData[header.id] = {
                    type: "version",
                    status: versionTypeMapping[component?.type] || 'Unknown',
                    value: component?.current_version || 'N/A',
                    component: component,
                };
            }
        }
        if(websiteInfo?.dataSourcesInfo) {
            for (const dataSource of websiteInfo.dataSourcesInfo) {
                if(dataSource.data) {
                    for (const header of extraHeaders) {
                        const data = dataSource.data.find((data) => data.id === header.id);
                        if(data?.status) {
                            siteData[header.id] = {
                                type: "status",
                                status: data.status,
                                value: data.status === 'success' ? "Success" : data.status === 'warning' ? "Warning" : "Error",
                                raw: data,
                                url: websiteObj.url,
                            };
                            if(data?.detailsFindings) {
                                siteData[header.id]['info'] = data.detailsFindings.map((finding) => finding.value).join(' ');
                            }
                        } else if(data?.detailsFindings) {
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
            if(!siteData[header.id]) {
                siteData[header.id] = {
                    type: "text",
                    value: 'N/A',
                }
            }
        }
        websitesData.push(siteData);
    }
    const allKeys: { id: string, label: string }[] = [];
    websitesData.forEach((website) => {
        Object.keys(website).forEach((key) => {
            const object = website[key];
            let title = object?.title ? object?.title : object?.label ? object?.label : object?.id ? object?.id : key;
            const checkIFExists = allKeys.find((k) => k.id === key);
            if(!checkIFExists) {
                allKeys.push({
                    id: key,
                    label: title
                });
            }
        });
    });
    return {
        facts: allKeys
    };
}

export async function createAlert(alertData: Partial<IAlert>) {
    const user = await getUser();

    const alert = new Alert({
        workspace: user.currentSelectedWorkspace || null,
        user: user.id,
        title: alertData.title,
        enabled: alertData.enabled,
        interval: alertData.interval,
        intervalUnit: alertData.intervalUnit,
        rules: alertData.rules,
    });

    const savedAlert = await alert.save();
    return {
        data: savedAlert.toJSON()
    }
}

export async function getWorkspaceAllAlerts(): Promise<IAlert[]> {
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
    const user = await getUser();
    await Alert.deleteOne({_id: alertId});
}

export async function updateAlert(alertId: string, alertData: Partial<IAlert>) {
    const user = await getUser();
    const alert = await Alert.findOne({_id: alertId});
    if (!alert) {
        throw new Error('Alert not found');
    }

    alert.set({
        title: alertData.title,
        enabled: alertData.enabled,
        rules: alertData.rules,
        interval: alertData.interval,
        intervalUnit: alertData.intervalUnit,
        events: alertData.events
    });

    alert.markModified('title');
    alert.markModified('enabled');
    alert.markModified('rules');
    alert.markModified('interval');
    alert.markModified('intervalUnit');
    alert.markModified('events');
    const savedAlert = await alert.save();
    return {
        data: savedAlert.toJSON()
    }
}

export async function getAlert(alertId: string): Promise<IAlert> {
    const user = await getUser();
    const alert = await Alert.findOne({_id: alertId});
    if(!alert) {
        throw new Error('Role not found');
    }
    return alert.toJSON();
}

