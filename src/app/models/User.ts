import {Model, model, models, Schema} from 'mongoose';
import {IWorkspace} from "@/app/models/Workspace";

export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    currentSelectedWorkspace?: typeof Schema.Types.ObjectId;
    roles?: (typeof Schema.Types.ObjectId)[];
    workspaces?: IWorkspace[];
}
const ModelSchema = new Schema<IUser>(
    {
        firstName: String,
        lastName: String,
        email: {type: String, unique: true},
        password: String,
        currentSelectedWorkspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        roles: [{type: Schema.Types.ObjectId, ref: 'Role'}],
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.currentSelectedWorkspace = ret.currentSelectedWorkspace?.toString();
                ret.roles = ret.roles?.map((role: any) => role.toString());
                delete ret._id;
            },
        },
    },
);
export const User = (models?.User || model('User', ModelSchema)) as Model<IUser>;