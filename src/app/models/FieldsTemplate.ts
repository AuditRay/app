import {Model, model, models, Schema} from 'mongoose';

export type Field = {
    id: string;
    title: string;
    type: string;
    required: boolean;
    defaultValue: string;
    options: string[];
    position: number;
    enabled: boolean;
}

export type FieldValue = {
    id: string;
    value: string;
};


export interface IFieldsTemplate {
    id: string;
    workspace: string | typeof Schema.Types.ObjectId;
    user: string | typeof Schema.Types.ObjectId;
    enabled: boolean;
    title: string;
    fields: Field[];
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IFieldsTemplate>(
    {
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        enabled: Boolean,
        title: String,
        fields: [{
            title: String,
            type: {type: String},
            required: Boolean,
            defaultValue: String,
            options: [String],
            position: Number,
            enabled: Boolean
        }],
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.workspace = ret.workspace?.toString();
                ret.user = ret.user.toString();
                ret.fields = ret.fields.map((field: any) => {
                    return {
                        id: field._id,
                        ...field,
                        _id: undefined,
                    }
                })
                delete ret._id;
            },
        },
    },
);

ModelSchema.index({ workspace: -1});
ModelSchema.index({ user: -1});
export const FieldsTemplate = (models?.FieldsTemplate || model<IFieldsTemplate>('FieldsTemplate', ModelSchema)) as Model<IFieldsTemplate>;