import {Model, model, models, Schema} from 'mongoose';
import {FieldValue} from "@/app/models/FieldsTemplate";

export type IFolder = {
    id: string;
    workspace: string | Schema.Types.ObjectId;
    name: string;
    image: string;
    fieldValues: FieldValue[];
}

const ModelSchema = new Schema<IFolder>(
    {
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        name: String,
        image: String,
        fieldValues: [],
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
export const Folder = (models?.Folder || model<IFolder>('Folder', ModelSchema)) as Model<IFolder>;