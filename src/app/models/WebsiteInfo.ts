import {Model, model, models, Schema} from 'mongoose';

export type UpdateInfo = {
    title: string;
    name: string;
    type: "NOT_SECURE" | "REVOKED" | "NOT_SUPPORTED" | "NOT_CURRENT" | "CURRENT";
    current_version: string;
    latest_version: string;
    recommended_version:string;
    available_releases: {
        name: string;
        version: string;
        attributes: object;
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

const ModelSchema = new Schema<IWebsiteInfo>(
    {
        website: {type: Schema.Types.ObjectId, ref: 'Website'},
        configData: {},
        frameworkInfo: {},
        websiteComponentsInfo: [],
        dataSourcesInfo: [],
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

export const WebsiteInfo = (models?.WebsiteInfo || model('WebsiteInfo', ModelSchema)) as Model<IWebsiteInfo>;