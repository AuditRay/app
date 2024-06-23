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

export interface IFiltersView {
    id: string;
    user: typeof Schema.Types.ObjectId;
    title: string;
    filters: any;
    columns: any;
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IFiltersView>(
    {
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        title: String,
        filters: {},
        columns: {},
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

export const FiltersView = (models?.FiltersView || model('FiltersView', ModelSchema)) as Model<IFiltersView>;