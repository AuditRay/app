'use server'
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {createPresignedPost} from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {v4 as uuid4} from "uuid";
import mime from "mime";

export const extensionToMime = async (ext: string) => mime.getType(ext);
export const mimeToExtension = async (type: string) => mime.getExtension(type);

const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const S3_REGION = process.env.S3_REGION || 'eu-west-1';
const S3_BUCKET = process.env.S3_BUCKET || 'monit-dev-assets';

export async function signS3UploadFolderImagePreSignedUrl(workspaceId: string, contentType: string) {
    const s3Client = new S3Client({
        region: S3_REGION,
        credentials:{
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY
        }
    });

    const extension = await mimeToExtension(contentType);

    const Key = `uploads/${workspaceId}/folders/${Date.now()}-${uuid4()}.${extension}`;
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        ContentType: contentType,
        Key,
    })
    return getSignedUrl(s3Client, command);
}

export async function signS3UploadFolderImageData(workspaceId: string, contentType: string) {

    const client = new S3Client({
        region: S3_REGION,
        credentials:{
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY
        }
    });
    const extension = await mimeToExtension(contentType);

    const Key = `uploads/${workspaceId}/folders/${Date.now()}-${uuid4()}.${extension}`;
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        ContentType: contentType,
        Key,
    })
    return await createPresignedPost(client, {
        Expires: 600,
        Bucket: S3_BUCKET,
        Key,
        Conditions: [
            ['content-length-range', 100, 100000000], // 100Byte - X (default 100MB)
        ],
        Fields: {
            'Content-Type': contentType,
            key: Key,
        },
    });
}