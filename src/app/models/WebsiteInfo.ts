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
        detailsExtra?: {
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

const ModelSchema = new Schema<IWebsiteInfo>(
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

ModelSchema.index({ website: -1});
ModelSchema.index({ createdAt: -1 });
ModelSchema.index({ website: -1, createdAt: -1 });

export const WebsiteInfo = (models?.WebsiteInfo || model<IWebsiteInfo>('WebsiteInfo', ModelSchema)) as Model<IWebsiteInfo>;