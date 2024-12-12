import {Model, model, models, Schema} from 'mongoose';

export type IAlert = {
    id: string;
    workspace: string | Schema.Types.ObjectId;
    user: string | Schema.Types.ObjectId;
    notifyUsers: string[];
    interval: number;
    intervalUnit: string;
    enabled: boolean;
    title: string;
    filters: any;
    events: any;
}

const ModelSchema = new Schema<IAlert>(
    {
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        notifyUsers: [{type: String}],
        interval: Number,
        intervalUnit: String,
        enabled: Boolean,
        title: String,
        filters: {},
        events: [],
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.workspace = ret.workspace?.toString();
                ret.user = ret.user.toString();
                delete ret._id;
            },
        },
    },
);

ModelSchema.index({ workspace: -1});
ModelSchema.index({ user: -1});
export const Alert = (models?.Alert || model<IAlert>('Alert', ModelSchema)) as Model<IAlert>;