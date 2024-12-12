import {Model, model, models, Schema} from 'mongoose';

export type IUpdateRun = {
    id: string;
    website: string | Schema.Types.ObjectId;
    status: "In Progress" | "Success" | "Failed";
    response: string;
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IUpdateRun>(
    {
        website: {type: Schema.Types.ObjectId, ref: 'Website'},
        status: String,
        response: String
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.website = ret.workspace?.toString();
                delete ret._id;
            },
        },
    },
);


ModelSchema.index({ website: -1});
ModelSchema.index({ user: -1});
export const UpdateRun = (models?.UpdateRun || model<IUpdateRun>('UpdateRun', ModelSchema)) as Model<IUpdateRun>;