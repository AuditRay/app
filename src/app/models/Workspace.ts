import {Model, model, models, Schema} from 'mongoose';
import {IWebsite} from "@/app/models/Website";

export interface IWorkspace {
    id: string;
    name: string;
    owner: string | typeof Schema.Types.ObjectId;
    users: (string | typeof Schema.Types.ObjectId)[];
}

const ModelSchema = new Schema<IWorkspace>(
    {
        name: String,
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.owner = ret.owner.toString();
                ret.users = ret.users?.map((role: any) => role.toString());
                delete ret._id;
            },
        },
    },
);
export const Workspace = (models?.Workspace || model('Workspace', ModelSchema)) as Model<IWorkspace>;