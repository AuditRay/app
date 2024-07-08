'use server'
import {IWebsite, Website, WebsiteType} from "@/app/models/Website";
import urlMetadata from "url-metadata";
import {CreateWebsiteSchema, CreateWebsiteState} from "@/app/lib/definitions";
import {connectMongo} from "@/app/lib/database";
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
// @ts-ignore
import * as WebappalyzerJS from 'webappalyzer-js';
import {jwtVerify, SignJWT} from "jose";
import {DataSources, IWebsiteInfo, WebsiteInfo} from "@/app/models/WebsiteInfo";
import {diff} from 'deep-object-diff';
import OpenAI from 'openai';
import {DefaultView, IWebsiteView, WebsiteView} from "@/app/models/WebsiteView";
import defaultViews from "@/app/views";
import {Model} from "mongoose";

function setupOpenAI() {
    if (!process.env.OPENAI_API_KEY) {
       throw new Error('Missing OPENAI_API_KEY');
    }
    return new OpenAI({apiKey: process.env.OPENAI_API_KEY});
}

const openai = setupOpenAI();

const websiteSecretKey = process.env.WEBSITE_SECRET
const encodedKey = new TextEncoder().encode(websiteSecretKey)

export type WebsiteTokenPayload = {
    websiteId: string;
}

export async function createKey(websiteId: string) {
    return encrypt({ websiteId });
}

export async function encrypt(payload: WebsiteTokenPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify<WebsiteTokenPayload>(session, encodedKey, {
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

export async function fetchUpdates(websiteId: string, sync: boolean = false): Promise<IWebsiteInfo | null> {
    const user = await getUser();
    const website = await Website.findOne({_id: websiteId, user: user.id});
    //get existing WebsiteInfo components
    const websiteLatestInfos = await WebsiteInfo.find({website: websiteId}).sort({createdAt: -1}).limit(1);
    const websiteLatestInfo = websiteLatestInfos[0];
    if (!website || !website.url || !website.token) {
        return null;
    }
    async function getWebsiteInfo(websiteId: string) {
        const website = await Website.findOne({_id: websiteId, user: user.id});
        if (!website || !website.url || !website.token) {
            return null;
        }

        //check if the website url ends with a slash, if not add a slash
        const websiteUrl= website.url.endsWith('/') ? website.url : `${website.url}/`;
        // Fetch updates from the website url using fetch library on the route /monit/health,
        // try to use the website.url if it's not working then website.url/web, use post method with body as form data
        let response = await fetch(`${websiteUrl}monit/health`, {
            method: 'POST',
            body: new URLSearchParams({
                token: website.token,
            }),
        });

        if (response.status === 404) {
            response = await fetch(`${websiteUrl}web/monit/health`, {
                method: 'POST',
                body: new URLSearchParams({
                    token: website.token,
                }),
            });
        }

        if (response.status !== 200) {
            console.log('Failed to fetch updates', response.status);
            return websiteLatestInfo?.toJSON() ?? null;
        }

        let data;
        try {
            data = await response.json();
        } catch (error) {
            return websiteLatestInfo?.toJSON() ?? null;
        }


        const dataSources: Record<string, any> = {
            ...data
        }
        //remove available_updates from dataSources
        delete dataSources.available_updates;
        //format dataSources
        const formattedDataSources: DataSources[] = Object.keys(dataSources).map((key) => {
            return {
                id: key,
                label: dataSources[key].label,
                description: dataSources[key].description,
                data: dataSources[key].data.map((data: any) => {
                    const newData = {...data};
                    delete newData.time;
                    return newData;
                })
            }
        });

        const preparedData = {
            website: websiteId,
            configData: {},
            frameworkInfo: data.available_updates.data.framework_info,
            websiteComponentsInfo: data.available_updates.data.website_components,
            dataSourcesInfo: formattedDataSources,
        }
        if(websiteLatestInfo) {

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
            const compare = diff({
                website: infoObj.website,
                configData: infoObj.configData || {},
                frameworkInfo: infoObj.frameworkInfo,
                websiteComponentsInfo: infoObj.websiteComponentsInfo,
                dataSourcesInfo: infoObj.dataSourcesInfo,
            }, preparedData);

            if(Object.keys(compare).length) {
                const newWebsiteInfo = new WebsiteInfo(preparedData);
                await newWebsiteInfo.save();
                // generateWebsiteAIUpdatesSummary(websiteId).then(() => {
                //     revalidatePath(`/website/${websiteId}`);
                // });
                return newWebsiteInfo.toJSON();
            } else {
                websiteLatestInfo.set('updatedAt', new Date());
                const updatedWebsiteInfo = await websiteLatestInfo.save();
                return updatedWebsiteInfo.toJSON();
            }
        } else {
            const newWebsiteInfo = new WebsiteInfo(preparedData);
            await newWebsiteInfo.save();
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
    const user = await getUser();
    const website = await Website.findOne({_id: websiteId, user: user.id});
    if (!website) {
        return null;
    }
    website.set(updateData);
    return website.save();
}

export async function getWebsite(websiteId: string): Promise<IWebsite | null> {
    const user = await getUser();
    const website = await Website.findOne({_id: websiteId, user: user.id});
    if(website && !website.aiSEOSummary) {
        // generateWebsiteAISeoSummary(websiteId).then(() => {
        //     revalidatePath(`/website/${websiteId}`);
        // });
    }
    return website?.toJSON() ?? null;
}

export async function getWebsiteInfo(websiteId: string): Promise<IWebsite | null> {
    const websiteInfo = await WebsiteInfo.findOne({_id: websiteId}).sort({createdAt: -1});
    return websiteInfo?.toJSON() ?? null;
}
export type frameWorkUpdateStatus = 'Up to Date' | 'Needs Update' | 'Security Update' | 'Revoked' | 'Unknown' | 'Not Supported';
export type tableSourceField = {
    type: 'string' | 'boolean' | 'version' | 'status',
    status?: string,
    value?: string,
    info?: string,
}
export type IWebsiteTable = IWebsite & {
    componentsNumber: number;
    componentsUpdatedNumber: number;
    componentsWithUpdatesNumber: number;
    componentsWithSecurityUpdatesNumber: number;
    frameWorkUpdateStatus: frameWorkUpdateStatus;
    [key: string]: string | number | string[] | frameWorkUpdateStatus | tableSourceField | any;
}
const versionTypeMapping = {
    NOT_CURRENT: 'Needs Update',
    CURRENT: 'Up to Date',
    NOT_SECURE: 'Security Update',
    REVOKED: 'Revoked',
    UNKNOWN: 'Unknown',
    NOT_SUPPORTED: 'Not Supported',
}
export async function getWebsitesTable(userId: string): Promise<{
    data: IWebsiteTable[]
    extraHeaders: { id: string, label: string}[]
}> {
    console.time('getWebsitesTable');
    const websites = await Website.find({user: userId});
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
        const componentsNumber = websiteInfo?.websiteComponentsInfo.length || 0;
        const componentsUpdatedNumber = websiteInfo?.websiteComponentsInfo.filter((component) => component.type === 'CURRENT').length || 0;
        const componentsWithUpdatesNumber = websiteInfo?.websiteComponentsInfo.filter((component) => component.type === 'NOT_CURRENT').length || 0;
        const componentsWithSecurityUpdatesNumber = websiteInfo?.websiteComponentsInfo.filter((component) => component.type === 'NOT_SECURE').length || 0;
        const frameWorkUpdateStatus = websiteInfo?.frameworkInfo.type || "UNKNOWN";
        let status: IWebsiteTable['frameWorkUpdateStatus'] = "Up to Date";
        if(componentsWithUpdatesNumber || frameWorkUpdateStatus === "NOT_CURRENT") {
            status = "Needs Update";
        }
        if(componentsWithSecurityUpdatesNumber || frameWorkUpdateStatus === "NOT_SECURE") {
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
            componentsNumber,
            componentsUpdatedNumber,
            componentsWithUpdatesNumber,
            componentsWithSecurityUpdatesNumber,
            frameWorkUpdateStatus: status
        }
        if(websiteInfo?.frameworkInfo){
            siteData.frameworkVersion = {
                type: "version",
                status: versionTypeMapping[websiteInfo.frameworkInfo?.type] || 'Unknown',
                value: websiteInfo.frameworkInfo.current_version || 'N/A',
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
                            };
                            if(data?.detailsFindings) {
                                siteData[header.id]['info'] = data.detailsFindings.map((finding) => finding.value).join(' ');
                            }
                        } else if(data?.detailsFindings) {
                            siteData[header.id] = {
                                type: "text",
                                value: data.detailsFindings.map((finding) => finding.value).join(' '),
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
    return {
        data: websitesData,
        extraHeaders: extraHeaders
    };
}

export async function getWebsites(userId: string): Promise<IWebsite[]> {
    const websites = await Website.find({user: userId});
    return websites.map(website => website.toJSON());
}

export async function getWebsiteViews(websiteId: string): Promise<DefaultView[]> {
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
    const user = await getUser();
    console.log('user', user);
    const validatedFields = CreateWebsiteSchema.safeParse({
        url: formData.get('url'),
        tags: formData.get('tags'),
    })

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { url, tags } = validatedFields.data

    console.log('tags', tags);
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
        if(results.technologies) {
            updatedWebsite.set("technologies",  results.technologies);
            if(updatedWebsite.technologies.length > 0) {
                const checkDrupal = updatedWebsite.technologies.find((tech) => tech.slug === 'drupal');
                const checkCloudFlare = updatedWebsite.technologies.find((tech) => tech.slug === 'cloudflare');
                const checkVarbase = updatedWebsite.technologies.find((tech) => tech.slug === 'varbase');
                const checkOther = updatedWebsite.technologies.find((tech) => ['wordpress', 'nodejs', 'react'].includes(tech.slug));

                if(checkDrupal) {
                    updatedWebsite.type = {
                        name: checkDrupal.name,
                        slug: checkDrupal.slug,
                        description: checkDrupal.description || '',
                        icon: `${checkDrupal.icon?.endsWith('.svg') ? 'converted/' + checkDrupal.icon?.replace('.svg', '.png') : `${checkDrupal.icon}`}`,
                        subTypes: []
                    }
                    if(checkVarbase) {
                        updatedWebsite.type.subTypes.push({
                            name: 'Varbase',
                            slug: 'varbase',
                            description: 'Varbase is a Drupal distribution packed with adaptive functionalities and essential modules, to build, launch and scale your Drupal projects faster.',
                            icon: `${checkVarbase.icon?.endsWith('.svg') ? 'converted/' + checkVarbase.icon?.replace('.svg', '.png') : `${checkVarbase.icon}`}`,
                            subTypes: []
                        })
                    }
                } else if(checkOther) {
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

                if(checkCloudFlare) {
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