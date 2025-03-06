import {Model, model, models, Schema} from 'mongoose';
import {FieldValue} from "@/app/models/FieldsTemplate";

export type IFolder = {
    id: string;
    workspace?: string | Schema.Types.ObjectId;
    user: string | Schema.Types.ObjectId;
    websites?: (string | Schema.Types.ObjectId)[];
    name: string;
    image: string;
    fieldValues: FieldValue[];
}

const ModelSchema = new Schema<IFolder>(
    {
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        websites: [{type: Schema.Types.ObjectId, ref: 'Website'}],
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
                ret.id = ret._id.toString();
                if(ret.websites) {
                    ret.websites = ret.websites.map((website: any) => website.toString());
                }
                delete ret._id;
            },
        },
    },
);

ModelSchema.index({ workspace: -1});
ModelSchema.index({ user: -1});
export const Folder = (models?.Folder || model<IFolder>('Folder', ModelSchema)) as Model<IFolder>;