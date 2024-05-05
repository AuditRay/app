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

export interface IWebsiteInfo {
    id: string;
    website: typeof Schema.Types.ObjectId;
    configData: Record<string, any>;
    frameworkInfo: UpdateInfo;
    websiteComponentsInfo: UpdateInfo[];
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IWebsiteInfo>(
    {
        website: {type: Schema.Types.ObjectId, ref: 'Website'},
        configData: {},
        frameworkInfo: {},
        websiteComponentsInfo: [],
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