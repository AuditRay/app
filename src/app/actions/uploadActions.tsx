'use server'
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {createPresignedPost} from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {v4 as uuid4} from "uuid";
import mime from "mime";

export const extensionToMime = async (ext: string) => mime.getType(ext);
export const mimeToExtension = async (type: string) => mime.getExtension(type);

export async function signS3UploadFolderImagePreSignedUrl(workspaceId: string, contentType: string) {
    const s3Client = new S3Client({
        region: 'eu-west-1',
        credentials:{
            accessKeyId: 'AKIA5L5AJ4DUESKISIWO',
            secretAccessKey: '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'
        }
    });

    const extension = await mimeToExtension(contentType);

    const Key = `uploads/${workspaceId}/folders/${Date.now()}-${uuid4()}.${extension}`;
    const command = new PutObjectCommand({
        Bucket: 'monit-dev-assets',
        ContentType: contentType,
        Key,
    })
    return getSignedUrl(s3Client, command);
}

export async function signS3UploadFolderImageData(workspaceId: string, contentType: string) {
    const client = new S3Client({
        region: 'eu-west-1',
        credentials:{
            accessKeyId: 'AKIA5L5AJ4DUESKISIWO',
            secretAccessKey: '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'
        }
    });

    const extension = await mimeToExtension(contentType);

    const Key = `uploads/${workspaceId}/folders/${Date.now()}-${uuid4()}.${extension}`;
    const command = new PutObjectCommand({
        Bucket: 'monit-dev-assets',
        ContentType: contentType,
        Key,
    })
    return await createPresignedPost(client, {
        Expires: 600,
        Bucket: 'monit-dev-assets',
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