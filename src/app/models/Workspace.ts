import {Model, model, models, Schema} from 'mongoose';
import {IWebsite} from "@/app/models/Website";
import {IUser} from "@/app/models/User";
import {IRole} from "@/app/models/Role";

export interface IWorkspace {
    id: string;
    name: string;
    owner: string | typeof Schema.Types.ObjectId;
    users: (string | typeof Schema.Types.ObjectId)[];
    timezone: string;
    members?: {
        user: typeof Schema.Types.ObjectId | string,
        roles: (string | typeof Schema.Types.ObjectId)[];
    }[];
}
export interface IMemberPopulated {
    user: IUser;
    roles: IRole[];
}

export interface IWorkspacePopulated {
    id: string;
    name: string;
    owner: IUser;
    timezone: string;
    users: (string | typeof Schema.Types.ObjectId)[];
    members?: IMemberPopulated[];
}

const ModelSchema = new Schema<IWorkspace>(
    {
        name: String,
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        users: [{type: Schema.Types.ObjectId, ref: 'User'}],
        timezone: String,
        members: [
            {
                user: {type: Schema.Types.ObjectId, ref: 'User'},
                roles: [{type: String, ref: 'Role'}],
            }
        ]
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.owner = ret.owner.toString();
                ret.members = ret.members?.map((member: any) => {
                    delete member._id;
                    if(!member.user.id) {
                        member.user = member.user.toString();
                    }
                    member.roles = member.roles?.map((role: any) => {
                        delete role._id;
                        if(!role.id) {
                            role = role.toString();
                        }
                        return role;
                    });
                    return member;
                });

                delete ret._id;
            },
        },
    },
);
export const Workspace = (models?.Workspace || model('Workspace', ModelSchema)) as Model<IWorkspace>;