import {Model, model, models, Schema} from 'mongoose';
import {IWebsiteTable} from "@/app/actions/websiteActions";

export type IAlertInfo = {
    id: string;
    workspace: string | Schema.Types.ObjectId;
    alert: string | Schema.Types.ObjectId;
    user: string | Schema.Types.ObjectId | null;
    type: 'email' | 'slack' | 'jira';
    subject: string;
    text: string;
    data: string;
    isSeen: boolean;
    isOpened: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IAlertInfo>(
    {
        workspace: {type: Schema.Types.ObjectId, ref: 'Workspace'},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        type: String,
        alert: {type: Schema.Types.ObjectId, ref: 'Alert'},
        subject: String,
        text: String,
        data: String,
        isSeen: Boolean,
        isOpened: Boolean
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.workspace = ret.workspace?.toString();
                ret.user = ret.user.toString();
                ret.alert = ret.alert.toString();
                delete ret._id;
            },
        },
    },
);


ModelSchema.index({ workspace: -1});
ModelSchema.index({ user: -1});
export const AlertInfo = (models?.AlertInfo || model<IAlertInfo>('AlertInfo', ModelSchema)) as Model<IAlertInfo>;