import {Model, model, models, Schema} from 'mongoose';

export interface IList {
    id: string;
    user: string | typeof Schema.Types.ObjectId;
    title: string;
    filters: any;
    workspace?: string | typeof Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IList>(
    {
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        title: String,
        filters: {},
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.user = ret.user.toString();
                ret.workspace = ret.workspace?.toString();
                delete ret._id;
            },
        },
    },
);

ModelSchema.index({ user: -1});

export const List = (models?.List || model<IList>('List', ModelSchema)) as Model<IList>;