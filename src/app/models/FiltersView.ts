import {Model, model, models, Schema} from 'mongoose';

export interface IFiltersView {
    id: string;
    user: string | typeof Schema.Types.ObjectId;
    title: string;
    filters: any;
    columns: any;
    workspace?: string | typeof Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IFiltersView>(
    {
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        title: String,
        filters: {},
        columns: {},
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
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

ModelSchema.index({ user: -1});

export const FiltersView = (models?.FiltersView || model('FiltersView', ModelSchema)) as Model<IFiltersView>;