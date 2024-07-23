import {Model, model, models, Schema} from 'mongoose';
import {IWorkspace} from "@/app/models/Workspace";

export interface ITeam {
    id: string;
    name: string;
    workspace: typeof Schema.Types.ObjectId;
    roles?: (typeof Schema.Types.ObjectId)[];
}

const ModelSchema = new Schema<ITeam>(
    {
        name: String,
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        roles: [{type: Schema.Types.ObjectId, ref: 'Role'}],
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.workspace = ret.workspace.toString();
                ret.roles = ret.roles?.map((role: any) => role.toString());
                delete ret._id;
            },
        },
    },
);
export const Team = (models?.Team || model('Team', ModelSchema)) as Model<ITeam>;