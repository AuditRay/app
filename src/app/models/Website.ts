import {Model, model, models, Schema} from 'mongoose';

export type WebsiteTechnology = {
    slug: string;
    name: string;
    description: string | null;
    confidence: number;
    version: string | null;
    icon: string | null;
    website: string | null;
    cpe: string | null;
    categories: {id: number, slug: string, name: string}[];
    [name: string] : any
}

export type WebsiteType = {
    name: string;
    slug: string;
    description: string;
    icon: string;
    subTypes: WebsiteType[];
}

export interface IWebsite {
    id: string;
    url: string;
    title: string;
    type: WebsiteType;
    user: typeof Schema.Types.ObjectId;
    favicon: string;
    token?: string;
    aiSummary?: string;
    aiSEOSummary?: string;
    tags?: string[];
    attributes: object;
    metadata: any;
    technologies: WebsiteTechnology[];
    defaultViewsConfiguration: {
        id: string;
        weight: number;
        enabled: boolean;
    }[];
}

const ModelSchema = new Schema<IWebsite>(
    {
        url: String,
        title: String,
        favicon: String,
        token: String,
        aiSummary: String,
        aiSEOSummary: String,
        tags: [String],
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        type: {},
        technologies: [],
        metadata: {},
        attributes: {},
        defaultViewsConfiguration: {},
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.user = ret.user.toString();
                delete ret._id;
            },
        },
    },
);

ModelSchema.index({ url: 1, user: 1}, { unique: true });

export const Website = (models?.Website || model('Website', ModelSchema)) as Model<IWebsite>;