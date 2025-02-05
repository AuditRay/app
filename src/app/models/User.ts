import {Model, model, models, Schema} from 'mongoose';
import {IWorkspace} from "@/app/models/Workspace";
import {IRole} from "@/app/models/Role";

export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    inviteToken: string;
    currentSelectedWorkspace?: string | typeof Schema.Types.ObjectId;
    workspaces?: IWorkspace[];
    roles?: IRole[];
}

export interface IUserInternal {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    currentSelectedWorkspace?: string | typeof Schema.Types.ObjectId;
    workspaces?: IWorkspace[];
    roles?: IRole[];
}
const ModelSchema = new Schema<IUser>(
    {
        firstName: String,
        lastName: String,
        email: {type: String, unique: true},
        password: String,
        inviteToken: String,
        currentSelectedWorkspace: {type: Schema.Types.ObjectId, ref: 'Workspace'}
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.currentSelectedWorkspace = ret.currentSelectedWorkspace?.toString();
                delete ret.password;
                delete ret._id;
            },
        },
    },
);
export const User = (models?.User || model<IUser>('User', ModelSchema)) as Model<IUser>;