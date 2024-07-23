import {Model, model, models, Schema} from 'mongoose';

export interface IRole {
    id: string;
    name: string;
    workspace: typeof Schema.Types.ObjectId;
    isWorkspace: boolean;
    permissions: Record<string, boolean>
}

const ModelSchema = new Schema<IRole>(
    {
        name: String,
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        isWorkspace: Boolean,
        permissions: {},
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.workspace = ret.workspace.toString();
                delete ret._id;
            },
        },
    },
);
export const Role = (models?.Role || model('Role', ModelSchema)) as Model<IRole>;