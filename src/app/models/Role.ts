import {Model, model, models, Schema} from 'mongoose';

export interface IRole {
    id: string;
    overrideId: string;
    name: string;
    workspace: typeof Schema.Types.ObjectId | string;
    isWorkspace: boolean;
    isDefault?: boolean;
    permissions: Record<string, boolean>
}

const ModelSchema = new Schema<IRole>(
    {
        name: String,
        overrideId: { type: String, index: true },
        workspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
        isWorkspace: Boolean,
        isDefault: Boolean,
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