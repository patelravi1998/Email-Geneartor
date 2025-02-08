import AWS from "aws-sdk";

import { getDataSource } from "../config/database";

export class PublisService {
  async uploadToS3(
    fileData: Buffer | ReadableStream | string,
    fileName: string,
    key?: string
  ) {
    try {
      const {
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_REGION,
        S3_BUCKET,
      } = process.env;

      if (
        !AWS_ACCESS_KEY_ID ||
        !AWS_SECRET_ACCESS_KEY ||
        !AWS_REGION ||
        !S3_BUCKET
      ) {
        throw new Error("Missing AWS environment variables");
      }

      // Configure AWS SDK
      AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION,
      });

      const S3 = new AWS.S3();
      const params: AWS.S3.PutObjectRequest = {
        Bucket: S3_BUCKET,
        Key: key!,
        Body: fileData,
      };
      let data = await S3.upload(params).promise();
      return data;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }
}

export default new PublisService();
