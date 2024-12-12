import {Model, model, models, Schema} from 'mongoose';

export type DataSource = {
    id: string;
    fields: string[];
}

export type DefaultView = {
    id: string;
    isDefault?: boolean;
    website?: typeof Schema.Types.ObjectId;
    user?: typeof Schema.Types.ObjectId;
    weight: number;
    enabled: boolean;
    title: string;
    dataSources: DataSource[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IWebsiteView {
    id: string;
    website: typeof Schema.Types.ObjectId;
    user: typeof Schema.Types.ObjectId;
    weight: number;
    enabled: boolean;
    title: string;
    dataSources: DataSource[];
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IWebsiteView>(
    {
        website: {type: Schema.Types.ObjectId, ref: 'Website'},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        weight: Number,
        enabled: Boolean,
        title: String,
        dataSources: [{
            id: String,
            fields: [String],
        }],
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.website = ret.website.toString();
                ret.user = ret.user.toString();
                ret.dataSources = ret.dataSources.map((ds: any) => {
                    delete ds._id;
                    return {
                        id: ds.id,
                        fields: ds.fields,
                    }
                })
                delete ret._id;
            },
        },
    },
);

ModelSchema.index({ website: -1});
ModelSchema.index({ user: -1});
export const WebsiteView = (models?.WebsiteView || model<IWebsiteView>('WebsiteView', ModelSchema)) as Model<IWebsiteView>;