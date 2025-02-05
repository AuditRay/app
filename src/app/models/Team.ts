import {Model, model, models, Schema} from 'mongoose';
import {IWorkspace} from "@/app/models/Workspace";
import {IUser, IUserInternal} from "@/app/models/User";
import {IWebsite} from "@/app/models/Website";
import {IRole} from "@/app/models/Role";

export interface ITeam {
    id: string;
    name: string;
    workspace: typeof Schema.Types.ObjectId | string;
    owner: typeof Schema.Types.ObjectId | string;
    members?: {
        user: typeof Schema.Types.ObjectId | string,
        role: string;
        websites?: (typeof Schema.Types.ObjectId | string)[];
    }[];
    websites?: (typeof Schema.Types.ObjectId | string)[];
}

export interface ITeamPopulated {
    id: string;
    name: string;
    workspace: typeof Schema.Types.ObjectId | string;
    owner: IUserInternal;
    members?: {
        user: IUserInternal,
        role: string;
        websites?: IWebsite[];
    }[];
    websites?: IWebsite[];
}

const ModelSchema = new Schema<ITeam>(
    {
        name: String,
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        members: [
            {
                user: {type: Schema.Types.ObjectId, ref: 'User'},
                role: String,
                websites: [{type: Schema.Types.ObjectId, ref: 'Website'}],
            }
        ],
        websites: [{type: Schema.Types.ObjectId, ref: 'Website'}],
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.workspace = ret.workspace.toString();
                if(!ret.owner.id) {
                    ret.owner = ret.owner.toString();
                } else if (typeof ret.owner.toJSON === 'function') {
                    ret.owner = ret.owner.toJSON();
                }
                ret.members = ret.members?.map((member: any) => {
                    delete member._id;
                    if(!member.user.id) {
                        member.user = member.user.toString();
                    } else if (typeof member.user.toJSON === 'function') {
                        member.user = member.user.toJSON();
                    }
                    member.websites = member.websites?.map((website: any) => {
                        delete website._id;
                        if(!website.id) {
                            website = website.toString();
                        } else if (typeof website.toJSON === 'function') {
                            website = website.toJSON();
                        }
                        return website;
                    });
                    return member;
                });
                ret.websites = ret.websites?.map((website: any) => {
                    delete website._id;
                    if(!website.id) {
                        website = website.toString();
                    } else if (typeof website.toJSON === 'function') {
                        website = website.toJSON();
                    }
                    return website;
                });
                delete ret._id;
            },
        },
    },
);
export const Team = (models?.Team || model<ITeam>('Team', ModelSchema)) as Model<ITeam>;