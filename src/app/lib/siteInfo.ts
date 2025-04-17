import {IWebsiteInfo, UpdateInfo, WebsiteInfo} from "@/app/models";
import {IWebsiteTable} from "@/app/actions/websiteActions";

export async function getSiteInfoStatus(websiteInfoId: string): Promise<IWebsiteInfo['websiteInfoStatus']> {
    const websiteInfo = await WebsiteInfo.findOne({
        _id: websiteInfoId
    }, {
        frameworkInfo: 1,
        websiteComponentsInfo: 1,
        updatedAt: 1,
        createdAt: 1,
    }).sort({createdAt: -1}).limit(1);
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

    return {
        componentsNumber: components.length,
        componentsUpdated: componentsUpdated,
        componentsUpdatedNumber: componentsUpdated.length,
        componentsWithUpdates: componentsWithUpdates,
        componentsWithUpdatesNumber: componentsWithUpdates.length,
        componentsWithSecurityUpdates: componentsWithSecurityUpdates,
        componentsWithSecurityUpdatesNumber: componentsWithSecurityUpdates.length,
        frameworkUpdateStatus: frameWorkUpdateStatus,
        frameworkUpdateStatusText: status,
        frameworkCurrentVersion: websiteInfo?.frameworkInfo.current_version || 'N/A',
        frameworkRecommendedVersion: websiteInfo?.frameworkInfo.recommended_version || 'N/A',
        frameworkLatestVersion: websiteInfo?.frameworkInfo.latest_version || 'N/A'
    }
}