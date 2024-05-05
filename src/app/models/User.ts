import { model, models, Schema } from 'mongoose';

export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
const ModelSchema = new Schema<IUser>(
    {
        firstName: String,
        lastName: String,
        email: {type: String, unique: true},
        password: String,
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                delete ret._id;
            },
        },
    },
);
export const User = models?.User || model('User', ModelSchema);