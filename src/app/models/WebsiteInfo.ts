import {Model, model, models, Schema} from 'mongoose';

export type UpdateInfo = {
    title: string;
    name: string;
    type: "NOT_SECURE" | "REVOKED" | "NOT_SUPPORTED" | "NOT_CURRENT" | "CURRENT" | "UNKNOWN";
    current_version: string;
    latest_version: string;
    recommended_version:string;
    available_releases: {
        name: string;
        version: string;
        attributes?: {
            terms?: Record<string, string[]>
            security?: string
        };
    }[]
}

export type DataSources = {
    id: string;
    label: string;
    description: string;
    data: {
        id: string;
        label: string;
        description: string;
        status: string;
        statusDescription: string;
        namespace: string;
        detailsTitle: string;
        detailsText: string[];
        detailsFindings: {
            type?: string;
            value?: string;
            items?: string[];
        }[];
        detailsExtra: {
            [key: string]: string[];
        };
    }[]
}

export interface IWebsiteInfo {
    id: string;
    website: typeof Schema.Types.ObjectId;
    configData: Record<string, any>;
    frameworkInfo: UpdateInfo;
    websiteComponentsInfo: UpdateInfo[];
    dataSourcesInfo: DataSources[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IWebsiteInfoInternal {
    id: string;
    website: typeof Schema.Types.ObjectId;
    configData: Record<string, any>;
    frameworkInfo: string;
    websiteComponentsInfo: string;
    dataSourcesInfo: string;
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IWebsiteInfoInternal>(
    {
        website: {type: Schema.Types.ObjectId, ref: 'Website'},
        configData: {},
        frameworkInfo: {},
        websiteComponentsInfo: {},
        dataSourcesInfo: {},
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.website = ret.website.toString();
                delete ret._id;
            },
        },
    },
);

ModelSchema.post('find', function(WebsiteInfos: any[]) {
    WebsiteInfos.forEach((WebsiteInfo) => {
        WebsiteInfo.set('frameworkInfo', JSON.parse(WebsiteInfo.frameworkInfo));
        WebsiteInfo.set('websiteComponentsInfo', JSON.parse(WebsiteInfo.websiteComponentsInfo));
        WebsiteInfo.set('dataSourcesInfo', JSON.parse(WebsiteInfo.dataSourcesInfo));
    });
    return WebsiteInfos;
});

ModelSchema.post('findOne', function(WebsiteInfo: any) {
    WebsiteInfo.set('frameworkInfo', JSON.parse(WebsiteInfo.frameworkInfo));
    WebsiteInfo.set('websiteComponentsInfo', JSON.parse(WebsiteInfo.websiteComponentsInfo));
    WebsiteInfo.set('dataSourcesInfo', JSON.parse(WebsiteInfo.dataSourcesInfo));

    return WebsiteInfo;
});

ModelSchema.post('save', function(WebsiteInfo: any) {
    WebsiteInfo.set('frameworkInfo', JSON.parse(WebsiteInfo.frameworkInfo));
    WebsiteInfo.set('websiteComponentsInfo', JSON.parse(WebsiteInfo.websiteComponentsInfo));
    WebsiteInfo.set('dataSourcesInfo', JSON.parse(WebsiteInfo.dataSourcesInfo));

    return WebsiteInfo;
});

ModelSchema.pre('save', function(next) {
    this.set('frameworkInfo', JSON.stringify(this.frameworkInfo));
    this.set('websiteComponentsInfo', JSON.stringify(this.websiteComponentsInfo));
    this.set('dataSourcesInfo', JSON.stringify(this.dataSourcesInfo));
    next();
});

ModelSchema.index({ website: -1});
ModelSchema.index({ createdAt: -1 });
ModelSchema.index({ website: -1, createdAt: -1 });

export const WebsiteInfo = (models?.WebsiteInfo || model('WebsiteInfo', ModelSchema)) as Model<IWebsiteInfo>;