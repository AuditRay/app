'use server'
import {IWebsite, Website} from "@/app/models/Website";
import urlMetadata from "url-metadata";
import {CreateWebsiteSchema, CreateWebsiteState} from "@/app/lib/definitions";
import {connectMongo} from "@/app/lib/database";
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
// @ts-ignore
import * as WebappalyzerJS from 'webappalyzer-js';
import {jwtVerify, SignJWT} from "jose";
import {DataSources, IWebsiteInfo, UpdateInfo, WebsiteInfo} from "@/app/models/WebsiteInfo";
import {WebsiteInfoFull} from "@/app/models/WebsiteInfoFull";
import {detailedDiff} from 'deep-object-diff';
import OpenAI from 'openai';
import {DefaultView, WebsiteView} from "@/app/models/WebsiteView";
import defaultViews from "@/app/views";
import {ITeamPopulated, IUpdateRun, IUser, UpdateRun, User} from "@/app/models";
import * as fs from "node:fs";
import {GridFilterModel, GridPaginationModel, GridSortModel, GridFilterItem} from "@mui/x-data-grid-pro";
import {filterWebsiteTable} from "@/app/lib/utils";

function setupOpenAI() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('Missing OPENAI_API_KEY');
    }
    return new OpenAI({apiKey: process.env.OPENAI_API_KEY});
}

const openai = setupOpenAI();

const websiteSecretKey = process.env.WEBSITE_SECRET
const encodedKey = new TextEncoder().encode(websiteSecretKey)

export type WebsiteStatistics = {
    status: {
        updated: number,
        withUpdates: number,
        withSecurityUpdates: number,
        notSupported: number,
        unknown: number,
    },
    frameworkVersions: Record<string, number>,
    securityIndex: number,
};

export type WebsiteTokenPayload = {
    websiteId: string;
}

export async function createKey(websiteId: string) {
    return encrypt({websiteId});
}

export async function encrypt(payload: WebsiteTokenPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const {payload} = await jwtVerify<WebsiteTokenPayload>(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.log('Failed to verify session')
    }
}

export async function generateWebsiteAIUpdatesSummary(websiteId: string) {
    const website = await Website.findOne({_id: websiteId});
    if (!website) {
        return null;
    }
    const websiteInfo = await WebsiteInfo.findOne({website: websiteId}).sort({createdAt: -1});
    if (!websiteInfo) {
        return null;
    }
    const websiteInfoObj = websiteInfo.toJSON();
    const websiteObj = website.toJSON();
    const aiContext = {
        website: {
            ...websiteObj,
            metadata: undefined,
            token: undefined,
        },
        frameworkUpdateInfo: {
            ...websiteInfoObj.frameworkInfo,
            available_releases: undefined
        },
        websiteComponentsUpdateInfo: websiteInfoObj.websiteComponentsInfo.map((component) => {
            return {
                ...component,
                available_releases: undefined
            }
        })
    }

    const aiContextString = JSON.stringify(aiContext);
    const updatesPrompt = `
    Given the above information about the the website updates please provide a summary 
    of the latest updates and recommendations of the website, DON'T INCLUDE SEO, MUST BE IN MARKDOWN FORMAT, DON'T ADD MAIN TITLE.`;

    const updatesCompletion = await openai.chat.completions.create({
        model: 'gpt-4-0125-preview',
        messages: [
            {
                role: 'system',
                content: "You are a website monitoring AI. You are here to help me with the latest updates and stats of my website."
            },
            {
                role: 'user',
                content: `Here are the info about the website: ${aiContextString}. ${updatesPrompt}`,
            },
        ],
        temperature: 1,
        max_tokens: 2000,
    });


    website.set('aiSummary', updatesCompletion.choices[0].message.content || undefined);
    await website.save();
}

export async function generateWebsiteAISeoSummary(websiteId: string) {
    const website = await Website.findOne({_id: websiteId});
    if (!website) {
        return null;
    }
    const websiteObj = website.toJSON();
    const aiContextMeta = {
        website: {
            ...websiteObj,
            metadata: {
                ...websiteObj.metadata,
                imgTags: undefined
            },
            token: undefined,
        }
    }

    const aiContextMetaString = JSON.stringify(aiContextMeta);
    const seoPrompt = `
    Given the above information about the website please provide a summary and a list of SEO recommendations for the website ONLY based on the provided data. 
    Also mention the good practices that are already in place. MUST BE IN MARKDOWN FORMAT, DON'T ADD MAIN TITLE`;

    const seoCompletion = await openai.chat.completions.create({
        model: 'gpt-4-0125-preview',
        messages: [
            {
                role: 'system',
                content: "You are a website SEO expert. You are here to help me with best practices for my website seo."
            },
            {
                role: 'user',
                content: `Here are the info about the website: ${aiContextMetaString}. ${seoPrompt}`,
            },
        ],
        temperature: 1,
        max_tokens: 2000,
    });

    website.set('aiSEOSummary', seoCompletion.choices[0].message.content || undefined);

    await website.save();
}

export async function getLatestWebsiteInfo(websiteId: string): Promise<IWebsiteInfo | null> {
    await connectMongo();
    console.log('getLatestWebsiteInfo');
    const user = await getUser();
    const website = await Website.findOne({_id: websiteId});
    //get existing WebsiteInfo components
    const websiteLatestInfos = await WebsiteInfo.find({website: websiteId}).sort({createdAt: -1}).limit(1);
    const websiteLatestInfo = websiteLatestInfos[0];
    if (!website || !website.url || !website.token) {
        return null;
    }
    return websiteLatestInfo?.toJSON() ?? null;
}

export async function getGetWebsiteUpdateRuns(websiteId: string): Promise<IUpdateRun[]> {
    await connectMongo();
    console.log('getGetWebsiteUpdateRubs');
    const updateRuns = await UpdateRun.find({website: websiteId});
    return updateRuns ? updateRuns.map((updateRun) => updateRun.toJSON()) : []
}



export async function fetchUpdates(websiteId: string, sync: boolean = false): Promise<IWebsiteInfo | null> {
    await connectMongo();
    console.log('fetchUpdates');
    const website = await Website.findOne({_id: websiteId});
    //get existing WebsiteInfo components
    const websiteLatestInfos = await WebsiteInfo.find({website: websiteId}).sort({createdAt: -1}).limit(1);
    const websiteLatestInfo = websiteLatestInfos[0];
    if (!website || !website.url || !website.token) {
        return null;
    }

    function prepareAvailableReleases(currentRelease: string, availableReleases: UpdateInfo['available_releases']): UpdateInfo['available_releases'] {
        if(availableReleases.length <= 20) {
            return availableReleases;
        }
        //
        // get the current release index,
        // if the current release index is in the first 5 releases, show the first 5 releases, and the last 5 releases
        // if the current release index is in the last 5 releases, show the first 5 releases, and the last 5 releases
        // if the current release index is in the middle, show the first 5 releases, the last 5 releases, and the current release with 3 releases before and after
        // add "... n more versions truncated" in between slices
        const currentReleaseIndex = availableReleases.findIndex((release) => release.version === currentRelease);
        if(currentReleaseIndex <= 5) {
            const slicedFirstReleases = availableReleases.slice(0, 5);
            const slicedLastReleases = availableReleases.slice(availableReleases.length - 5, availableReleases.length);
            const truncatedReleases = availableReleases.length - 10;
            return [
                ...slicedFirstReleases,
                {
                    name: `...`,
                    version: `... and ${truncatedReleases} more versions truncated ...`,
                },
                ...slicedLastReleases
            ];
        } else if(currentReleaseIndex >= availableReleases.length - 5) {
            const slicedFirstReleases = availableReleases.slice(0, 5);
            const slicedLastReleases = availableReleases.slice(availableReleases.length - 5, availableReleases.length);
            const truncatedReleases = availableReleases.length - 10;
            return [
                ...slicedFirstReleases,
                {
                    name: '...',
                    version: `... and ${truncatedReleases} more versions truncated ...`,
                },
                ...slicedLastReleases
            ];
        } else {
            const slicedFirstReleases = availableReleases.slice(0, 5);
            const slicedLastReleases = availableReleases.slice(availableReleases.length - 5, availableReleases.length);
            const currentReleaseSliced = availableReleases.slice(currentReleaseIndex - 3, currentReleaseIndex + 4);
            //get how many releases are truncated between the first and current release
            const truncatedFirstReleases = (currentReleaseIndex + 1) - 3 - 5;
            //get how many releases are truncated between the current and last release
            const truncatedLastReleases = availableReleases.length - 8 - (currentReleaseIndex + 1);
            return [
                ...slicedFirstReleases,
                {
                    name: '...',
                    version: `... and ${truncatedFirstReleases} more versions truncated ...`,
                },
                ...currentReleaseSliced,
                {
                    name: '...',
                    version: `... and ${truncatedLastReleases} more versions truncated ...`,
                },
                ...slicedLastReleases
            ];
        }
    }

    async function getWebsiteInfo(websiteId: string) {
        console.log("getWebsiteInfo");
        const website = await Website.findOne({_id: websiteId});
        if (!website || !website.url || !website.token) {
            return null;
        }
        const updateRun = new UpdateRun({
            website: websiteId,
            status: "In Progress",
            response: "",
        })
        const savedUpdateRun = await updateRun.save();
        console.log('savedUpdateRun', savedUpdateRun);
        //check if the website url ends with a slash, if not add a slash
        const websiteUrl = website.url.endsWith('/') ? website.url : `${website.url}/`;
        // Fetch updates from the website url using fetch library on the route /monit/health,
        // try to use the website.url if it's not working then website.url/web, use post method with body as form data
        let response = await fetch(`${websiteUrl}monit/health`, {
            method: 'POST',
            body: new URLSearchParams({
                token: website.token,
            }),
            cache: 'no-cache',
        }).catch((error) => {
            console.error('Failed to fetch updates', error);
            savedUpdateRun.set('status', 'Failed');
            savedUpdateRun.set('response', error);
        });


        if (response && response.status === 404) {
            response = await fetch(`${websiteUrl}web/monit/health`, {
                method: 'POST',
                body: new URLSearchParams({
                    token: website.token,
                }),
                cache: 'no-cache',
            }).catch((error) => {
                console.error('Failed to fetch updates', error);
                savedUpdateRun.set('status', 'Failed');
                savedUpdateRun.set('response', error);
            });
        }

        if (response && response.status !== 200) {
            console.log('Failed to fetch updates', response.status);
            const responseText = await response.text();
            savedUpdateRun.set('status', 'Failed');
            savedUpdateRun.set('response', responseText);
            await savedUpdateRun.save();
            return websiteLatestInfo?.toJSON() ?? null;
        }

        let data;
        try {
            data = await response?.json();
        } catch (error) {
            return websiteLatestInfo?.toJSON() ?? null;
        }


        const dataSources: Record<string, any> = {
            ...data
        }
        //remove available_updates from dataSources
        delete dataSources.available_updates;
        //format dataSources
        const formattedDataSourcesFull: DataSources[] = Object.keys(dataSources).map((key) => {
            return {
                id: key,
                label: dataSources[key].label,
                description: dataSources[key].description,
                data: dataSources[key].data.map((data: DataSources['data'][number] & {time: any}) => {
                    const newData = {...data};
                    if(newData.id.includes('security_review-')) {
                        newData.id = newData.id.replace('security_review-', '');
                        if (newData.id === "monit_security_review_file_perms") {
                            newData.id = "monit_security_review_file_permissions";
                        }
                    }
                    delete newData.time;
                    return newData;
                })
            }
        });
        const formattedDataSources: DataSources[] = Object.keys(dataSources).map((key) => {
            return {
                id: key,
                label: dataSources[key].label,
                description: dataSources[key].description,
                data: dataSources[key].data.map((data: DataSources['data'][number] & {time: any}) => {
                    const newData = {...data};
                    if(newData.id.includes('security_review-')) {
                        newData.id = newData.id.replace('security_review-', '');
                        if (newData.id === "monit_security_review_file_perms") {
                            newData.id = "monit_security_review_file_permissions";
                        }
                    }
                    newData.detailsFindings = newData.detailsFindings?.map((finding: any) => {
                        if(finding.items?.length >= 50) {
                            const length = finding.items.length;
                            const last25Items = finding.items.slice(length - 25, length);
                            finding.items = finding.items.slice(0, 25);
                            finding.items.push(`... and ${length - 50} more items truncated ...`);
                            finding.items.push(...last25Items);
                        }
                        return finding;
                    });
                    delete newData.detailsExtra;
                    delete newData.time;
                    return newData;
                })
            }
        });

        const formattedFrameworkInfo: UpdateInfo = {
            ...data.available_updates.data.framework_info,
            available_releases: prepareAvailableReleases(
                data.available_updates.data.framework_info.current_version,
                data.available_updates.data.framework_info.available_releases
            ),
        }

        const formattedWebsiteComponentsInfo: UpdateInfo[] = data.available_updates.data.website_components.map((component: UpdateInfo) => {
            return {
                ...component,
                available_releases: prepareAvailableReleases(
                    component.current_version,
                    component.available_releases
                ),
            }
        });

        const preparedData = {
            website: websiteId,
            configData: {},
            frameworkInfo: formattedFrameworkInfo,
            websiteComponentsInfo: formattedWebsiteComponentsInfo,
            dataSourcesInfo: formattedDataSources,
        }

        const preparedDataFull = {
            website: websiteId,
            configData: {},
            frameworkInfo: data.available_updates.data.framework_info,
            websiteComponentsInfo: data.available_updates.data.website_components,
            dataSourcesInfo: formattedDataSourcesFull,
        }
        if (websiteLatestInfo) {
            // if(!website.aiSummary) {
            //     generateWebsiteAIUpdatesSummary(websiteId).then(() => {
            //         revalidatePath(`/website/${websiteId}`);
            //     }).catch((error) => {
            //         console.error('Failed to generate AI Summary', error);
            //     });
            // }
            //
            // if(!website.aiSEOSummary) {
            //     generateWebsiteAISeoSummary(websiteId).then(() => {
            //         revalidatePath(`/website/${websiteId}`);
            //     }).catch((error) => {
            //         console.error('Failed to generate AI Summary', error);
            //     });
            // }
            const infoObj = websiteLatestInfo.toJSON();
            const compare = detailedDiff({
                website: infoObj.website,
                configData: infoObj.configData || {},
                frameworkInfo: infoObj.frameworkInfo,
                websiteComponentsInfo: infoObj.websiteComponentsInfo,
                dataSourcesInfo: infoObj.dataSourcesInfo,
            }, preparedData);

            const added = Object.keys(compare.added).length;
            const deleted = Object.keys(compare.deleted).length;
            const updated = Object.keys(compare.updated).length;
            const updatedKeys = Object.keys(compare.updated);
            const newVersion = added > 0 || deleted > 0 || updatedKeys.includes('frameworkInfo') || updatedKeys.includes('websiteComponentsInfo') || (updated > 2 && updatedKeys.includes('dataSourcesInfo'));
            savedUpdateRun.set('status', 'Success');
            savedUpdateRun.set('response', "");
            await savedUpdateRun.save();
            if (newVersion) {
                const newWebsiteInfo = new WebsiteInfo(preparedData);
                const newWebsiteInfoFull = new WebsiteInfoFull(preparedDataFull);
                await newWebsiteInfo.save();
                await newWebsiteInfoFull.save();
                // generateWebsiteAIUpdatesSummary(websiteId).then(() => {
                //     revalidatePath(`/website/${websiteId}`);
                // });
                return newWebsiteInfo.toJSON();
            } else {
                websiteLatestInfo.set('updatedAt', new Date());
                const updatedWebsiteInfo = await websiteLatestInfo.save();
                savedUpdateRun.set('status', 'Success');
                savedUpdateRun.set('response', "");
                await savedUpdateRun.save();
                return updatedWebsiteInfo.toJSON();
            }
        } else {
            savedUpdateRun.set('status', 'Success');
            savedUpdateRun.set('response', "");
            await savedUpdateRun.save();
            const newWebsiteInfo = new WebsiteInfo(preparedData);
            const newWebsiteInfoFull = new WebsiteInfoFull(preparedDataFull);
            await newWebsiteInfo.save();
            await newWebsiteInfoFull.save();
            return newWebsiteInfo.toJSON();
        }
    }

    if (sync) {
        return await getWebsiteInfo(websiteId);
    } else {
        getWebsiteInfo(websiteId).then(() => {
            revalidatePath(`/website/${websiteId}`);
        });
        return websiteLatestInfo?.toJSON() ?? null;
    }
}

export async function updateWebsite(websiteId: string, updateData: Partial<IWebsite>): Promise<IWebsite | null> {
    await connectMongo();
    console.log('updateWebsite');
    const user = await getUser();
    const website = await Website.findOne({_id: websiteId});
    if (!website) {
        return null;
    }
    website.set(updateData);
    website.markModified('syncConfig');
    const updatedWebsite = await website.save();
    revalidatePath(`/website/${websiteId}`);
    return updatedWebsite.toJSON();
}

export async function deleteWebsite(websiteId: string): Promise<IWebsite | null> {
    await connectMongo();
    console.log('deleteWebsite');
    return updateWebsite(websiteId, {isDeleted: true});
}

export async function getWebsite(websiteId: string): Promise<IWebsite | null> {
    await connectMongo();
    console.log('getWebsite', websiteId);
    const website = await Website.findOne({_id: websiteId});
    if (website && !website.aiSEOSummary) {
        // generateWebsiteAISeoSummary(websiteId).then(() => {
        //     revalidatePath(`/website/${websiteId}`);
        // });
    }
    return website?.toJSON() ?? null;
}

export async function getWebsiteInfo(websiteId: string): Promise<IWebsite | null> {
    await connectMongo();
    console.log('getWebsiteInfo');
    const websiteInfo = await WebsiteInfo.findOne({_id: websiteId}).sort({createdAt: -1});
    return websiteInfo?.toJSON() as any as IWebsite ?? null;
}

export type frameWorkUpdateStatus =
    'Up to Date'
    | 'Needs Update'
    | 'Security Update'
    | 'Revoked'
    | 'Unknown'
    | 'Not Supported';
export type tableSourceField = {
    type: 'string' | 'boolean' | 'version' | 'status',
    status?: string,
    value?: string,
    info?: string,
    raw: DataSources['data'][0]
    component?: IWebsiteInfo['websiteComponentsInfo'][0]
    url: string
}
export type IWebsiteTable = IWebsite & {
    components: UpdateInfo[];
    componentsUpdated: UpdateInfo[];
    componentsWithUpdates: UpdateInfo[];
    componentsWithSecurityUpdates: UpdateInfo[];
    frameWorkUpdateStatus: frameWorkUpdateStatus;
    [key: string]: string | number | string[] | frameWorkUpdateStatus | tableSourceField | UpdateInfo[] | any;
}
const versionTypeMapping = {
    NOT_CURRENT: 'Needs Update',
    CURRENT: 'Up to Date',
    NOT_SECURE: 'Security Update',
    REVOKED: 'Revoked',
    UNKNOWN: 'Unknown',
    NOT_SUPPORTED: 'Not Supported',
}

export async function countWebsites(workspaceId: string): Promise<number> {
    await connectMongo();
    console.log('countWebsites');
    if (workspaceId === 'personal') {
        let user = await getUser();
        let userId = user.id;
        return Website.countDocuments({user: userId});
    } else {
        return Website.countDocuments({workspace: workspaceId});
    }
}

export async function getWebsitesTable(
        workspaceId: string,
        pagination: GridPaginationModel = { page: 0, pageSize: 10 },
        filters: GridFilterModel = { items: [] },
        sort: GridSortModel = []
    ): Promise<{
        data: IWebsiteTable[];
        count: number;
        remaining: number;
        extraHeaders: { id: string, label: string }[];
        statistics: WebsiteStatistics
    }> {
    await connectMongo();
    console.log('getWebsitesTable');

    console.time('getWebsitesTable');
    let websites = [];
    if (workspaceId == "personal") {
        let user = await getUser();
        let userId = user.id;
        websites = await Website.find({user: userId, isDeleted: {$ne: true}});
    } else {
        websites = await Website.find({
            workspace:workspaceId,
            isDeleted: {$ne: true}
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
            siteUrl: websiteObj.url,
            types: websiteObj.type ? [websiteObj.type.name, ...(websiteObj.type.subTypes.map((subType) => subType.name))] : [],
            tags: websiteObj.tags,
            components,
            componentsNumber: components.length,
            componentsUpdated,
            componentsUpdatedNumber: componentsUpdated.length,
            componentsWithUpdates,
            componentsWithUpdatesNumber: componentsWithUpdates.length,
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

    const statistics: WebsiteStatistics = {
        status: {
            updated: 0,
            withUpdates: 0,
            withSecurityUpdates: 0,
            notSupported: 0,
            unknown: 0,
        },
        frameworkVersions: {},
        securityIndex: 0,
    }

    for (const website of websitesData) {
        if (website.frameWorkUpdateStatus === "Up to Date") statistics.status.updated++;
        if (website.frameWorkUpdateStatus === "Needs Update") statistics.status.withUpdates++;
        if (website.frameWorkUpdateStatus === "Security Update") statistics.status.withSecurityUpdates++;
        if (website.frameWorkUpdateStatus === "Not Supported") statistics.status.notSupported++;
        if (website.frameWorkUpdateStatus === "Unknown") statistics.status.unknown++;
        //get the first 2 parts of the version and replace the last part with x
        const frameworkVersion = website.frameworkVersion.value?.split('.').slice(0, 2).join('.');
        if (statistics.frameworkVersions[frameworkVersion]) {
            statistics.frameworkVersions[frameworkVersion]++;
        } else {
            statistics.frameworkVersions[frameworkVersion] = 1;
        }
    }
    if (statistics.frameworkVersions['N/A']) {
        delete statistics.frameworkVersions['N/A'];
    }

    statistics.securityIndex = Math.ceil((statistics.status.withSecurityUpdates / (websitesData.length - statistics.status.updated)) * 100);

    if (filters.items.length) {
        console.log('filters.items', filters, filters.items);
        const filteredData = websitesData.filter((website) => {
            return filterWebsiteTable(website, filters);
        });
        console.log('filteredData', filteredData.length);
        websitesData.length = 0;
        websitesData.push(...filteredData);
    }
    if(sort.length) {
        websitesData.sort((a, b) => {
            for(const sortItem of sort) {
                const field = sortItem.field;
                const order = sortItem.sort;
                if (a[field].value && b[field].value) {
                    if(a[field].value < b[field].value) {
                        return order === 'asc' ? -1 : 1;
                    }
                    if(a[field].value > b[field].value) {
                        return order === 'asc' ? 1 : -1;
                    }
                } else {
                    if (a[field] < b[field]) {
                        return order === 'asc' ? -1 : 1;
                    }
                    if (a[field] > b[field]) {
                        return order === 'asc' ? 1 : -1;
                    }
                }
            }
            return 0;
        });
    }
    console.timeEnd('process websitesTable');
    // const mb = 1024 * 1024;
    // const mByteSize = (str: string) => new Blob([str]).size / mb;
    // console.log('websitesData', mByteSize(JSON.stringify(websitesData)));
    // console.log('extraHeaders', mByteSize(JSON.stringify(extraHeaders)));
    // //write data to file
    // fs.writeFileSync('websitesData.json', JSON.stringify({
    //     data: websitesData,
    //     extraHeaders: extraHeaders
    // }, null, 2));
    // calculate the page and pageSize check if out of websitesData bounds
    const start = pagination.page * pagination.pageSize < 0 ? 0 : pagination.page * pagination.pageSize;
    const end = start + pagination.pageSize;

    return {
        data: websitesData.slice(start > websitesData.length ? websitesData.length - pagination.pageSize : start, end > websitesData.length ? websitesData.length : end),
        count: websitesData.length,
        remaining: websitesData.length - end,
        extraHeaders: extraHeaders,
        statistics
    };
}

export async function getWebsites(userId?: string): Promise<IWebsite[]> {
    await connectMongo();
    console.log('getWebsites');
    let user: IUser | null = await getUser();
    if (userId) {
        user = await User.findOne({_id: userId});
    }
    if (!user) {
        throw new Error('User not found');
    }
    let websites: any[] = [];
    if (!user.currentSelectedWorkspace) {
        websites = await Website.find({user: user.id});
    } else {
        websites = await Website.find({workspace: user.currentSelectedWorkspace});
    }
    return websites.map(website => website.toJSON());
}

export async function getWebsitesListing(workspaceId: string): Promise<IWebsite[]> {
    await connectMongo();
    console.log('getWebsitesListing');
    let user: IUser = await getUser();
    if (!user) {
        throw new Error('User not found');
    }
    if (workspaceId === 'personal') {
        const websites = await Website.find({user: user.id, workspace: null}, {_id: 1, title: 1, url: 1, type: 1, favicon: 1});
        return websites.map(website => website.toJSON());
    }
    const websites = await Website.find({workspace: workspaceId}, {
        _id: 1,
        title: 1,
        url: 1,
        type: 1,
        favicon: 1
    });
    return websites.map(website => website.toJSON());
}

export async function getWebsiteViews(websiteId: string): Promise<DefaultView[]> {
    await connectMongo();
    console.log('getWebsiteViews');
    const website = await Website.findOne({_id: websiteId});
    if (!website) return [];
    const websiteViews = await WebsiteView.find({website: websiteId});
    const websiteViewsData = websiteViews.map(websiteView => websiteView.toJSON());
    const defaultViewsData = defaultViews.map(view => {
        const config = website.defaultViewsConfiguration?.find((defaultView) => defaultView.id === view.id);
        if (!config) return view;
        return {
            ...view,
            enabled: config.enabled,
            weight: config.weight,
        }
    });
    const viewsData = [...defaultViewsData, ...websiteViewsData];
    const filteredViewsData = viewsData.filter(view => view.enabled);
    return filteredViewsData.sort((a, b) => a.weight - b.weight);
}

export async function createWebsite(state: CreateWebsiteState, formData: FormData) {
    await connectMongo();
    console.log('createWebsite');
    const user = await getUser();
    const validatedFields = CreateWebsiteSchema.safeParse({
        url: formData.get('url'),
        tags: formData.get('tags'),
        syncConfig: {
            enabled: formData.get('sync-enabled') === 'on',
            syncInterval: parseInt(formData.get('sync-interval') as string) || 1,
            intervalUnit: formData.get('sync-interval-unit') || 'Day',
        }
    })

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const {url, tags, syncConfig} = validatedFields.data

    await connectMongo();

    const options = {
        debug: false,
        delay: 500,
        headers: {},
        maxDepth: 1,
        maxUrls: 1,
        maxWait: 5000,
        recursive: true,
        probe: false,
        proxy: false,
        userAgent: 'Wappalyzer',
        htmlMaxCols: 2000,
        htmlMaxRows: 2000,
        noScripts: false,
        noRedirect: false,
    };


    let website = new Website({
        url,
        tags: tags || [],
        user: user.id,
        syncConfig,
        workspace: user.currentSelectedWorkspace
    });

    try {
        website = await website.save();
        const token = await createKey(website.id);
        website.set("token", token);
        await website.save();
    } catch (error) {
        if ((error as any).code === 11000) {
            return {
                errors: {
                    url: ['Website already exists'],
                },
            }
        }
        return {
            message: 'An error occurred',
        }
    }
    const wappalyzer = new WebappalyzerJS(options)
    try {
        const metadata = await urlMetadata(url);
        if (metadata) {
            website.set("metadata", metadata);
            website.title = metadata.name || metadata.title || metadata.url
            if (metadata.favicons?.length > 0) {
                if (metadata.favicons[0]?.href.startsWith('http') || metadata.favicons[0]?.href.startsWith('https')) {
                    website.favicon = metadata.favicons[0]?.href;
                } else {
                    website.favicon = `${metadata.requestUrl}${metadata.favicons[0]?.href}`;
                }
            } else {
                website.favicon = '/tech/other.png';
            }
        }
        const updatedWebsite = await website.save();

        await wappalyzer.init()

        // Optionally set additional request headers
        const headers = {}

        // Optionally set local and/or session storage
        const storage = {
            local: {},
            session: {}
        }

        const site = await wappalyzer.open(url, headers, storage)

        const results = await site.analyze()
        if (results.technologies) {
            updatedWebsite.set("technologies", results.technologies);
            if (updatedWebsite.technologies.length > 0) {
                const checkDrupal = updatedWebsite.technologies.find((tech) => tech.slug === 'drupal');
                const checkCloudFlare = updatedWebsite.technologies.find((tech) => tech.slug === 'cloudflare');
                const checkVarbase = updatedWebsite.technologies.find((tech) => tech.slug === 'varbase');
                const checkOther = updatedWebsite.technologies.find((tech) => ['wordpress', 'nodejs', 'react'].includes(tech.slug));

                if (checkDrupal) {
                    updatedWebsite.type = {
                        name: checkDrupal.name,
                        slug: checkDrupal.slug,
                        description: checkDrupal.description || '',
                        icon: `${checkDrupal.icon?.endsWith('.svg') ? 'converted/' + checkDrupal.icon?.replace('.svg', '.png') : `${checkDrupal.icon}`}`,
                        subTypes: []
                    }
                    if (checkVarbase) {
                        updatedWebsite.type.subTypes.push({
                            name: 'Varbase',
                            slug: 'varbase',
                            description: 'Varbase is a Drupal distribution packed with adaptive functionalities and essential modules, to build, launch and scale your Drupal projects faster.',
                            icon: `${checkVarbase.icon?.endsWith('.svg') ? 'converted/' + checkVarbase.icon?.replace('.svg', '.png') : `${checkVarbase.icon}`}`,
                            subTypes: []
                        })
                    }
                } else if (checkOther) {
                    updatedWebsite.type = {
                        name: checkOther.name,
                        slug: checkOther.slug,
                        description: checkOther.description || '',
                        icon: `${checkOther.icon?.endsWith('.svg') ? 'converted/' + checkOther.icon?.replace('.svg', '.png') : `${checkOther.icon}`}`,
                        subTypes: []
                    }
                } else {
                    updatedWebsite.type = {
                        name: 'Other',
                        slug: 'other',
                        description: 'Other technologies',
                        icon: 'other.png',
                        subTypes: []
                    }
                }

                if (checkCloudFlare) {
                    updatedWebsite.type.subTypes.push({
                        name: 'Cloudflare',
                        slug: 'cloudflare',
                        description: 'Cloudflare is a web-infrastructure and website-security company, providing content-delivery-network services, DDoS mitigation, Internet security, and distributed domain-name-server services.',
                        icon: `${checkCloudFlare.icon?.endsWith('.svg') ? 'converted/' + checkCloudFlare.icon?.replace('.svg', '.png') : `${checkCloudFlare.icon}`}`,
                        subTypes: []
                    })
                }
            }

            // generateWebsiteAISeoSummary(updatedWebsite.id).then(() => {
            //     revalidatePath(`/website/${updatedWebsite.id}`);
            // });

            await updatedWebsite.save();
        }
    } catch (error) {
        console.error(error)
    }

    await wappalyzer.destroy()

    revalidatePath('/websites');
    return {
        data: website.toJSON()
    };
}