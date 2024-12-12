import {Model, model, models, Schema} from 'mongoose';
import {IWebsiteInfo, IWebsiteInfoInternal} from "@/app/models/WebsiteInfo";

const ModelSchema = new Schema<IWebsiteInfoInternal>(
    {
        website: {type: Schema.Types.ObjectId, ref: 'Website'},
        configData: {},
        frameworkInfo: {},
        websiteComponentsInfo: {},
        dataSourcesInfo: {},
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                ret.website = ret.website.toString();
                delete ret._id;
            },
        },
    },
);

ModelSchema.post('find', function(WebsiteInfos: any[]) {
    WebsiteInfos.forEach((WebsiteInfo) => {
        WebsiteInfo.set('frameworkInfo', JSON.parse(WebsiteInfo.frameworkInfo));
        WebsiteInfo.set('websiteComponentsInfo', JSON.parse(WebsiteInfo.websiteComponentsInfo));
        WebsiteInfo.set('dataSourcesInfo', JSON.parse(WebsiteInfo.dataSourcesInfo));
    });
    return WebsiteInfos;
});

ModelSchema.post('findOne', function(WebsiteInfo: any) {
    WebsiteInfo.set('frameworkInfo', JSON.parse(WebsiteInfo.frameworkInfo));
    WebsiteInfo.set('websiteComponentsInfo', JSON.parse(WebsiteInfo.websiteComponentsInfo));
    WebsiteInfo.set('dataSourcesInfo', JSON.parse(WebsiteInfo.dataSourcesInfo));

    return WebsiteInfo;
});

ModelSchema.post('save', function(WebsiteInfo: any) {
    WebsiteInfo.set('frameworkInfo', JSON.parse(WebsiteInfo.frameworkInfo));
    WebsiteInfo.set('websiteComponentsInfo', JSON.parse(WebsiteInfo.websiteComponentsInfo));
    WebsiteInfo.set('dataSourcesInfo', JSON.parse(WebsiteInfo.dataSourcesInfo));

    return WebsiteInfo;
});

ModelSchema.pre('save', function(next) {
    this.set('frameworkInfo', JSON.stringify(this.frameworkInfo));
    this.set('websiteComponentsInfo', JSON.stringify(this.websiteComponentsInfo));
    this.set('dataSourcesInfo', JSON.stringify(this.dataSourcesInfo));
    next();
});

ModelSchema.index({ website: -1});
ModelSchema.index({ createdAt: -1 });
ModelSchema.index({ website: -1, createdAt: -1 });

export const WebsiteInfoFull = (models?.WebsiteInfoFull || model<IWebsiteInfoInternal>('WebsiteInfoFull', ModelSchema)) as Model<IWebsiteInfo>;