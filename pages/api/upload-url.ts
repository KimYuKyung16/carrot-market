import S3 from "aws-sdk/clients/s3";
import { NextApiRequest, NextApiResponse } from "next";
import getExtension from "@libs/client/getExtension";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const s3 = new S3({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
  });

  const { file, fileType, userId, type } = req.query;
  const { fileExtenstion } = getExtension(file as string);
  const nFilename = (type === "profile" ? "profile/" : "product/") + Date.now() + "_" + userId + fileExtenstion;

  const image = await s3.createPresignedPost({
    Bucket: process.env.BUCKET_NAME,
    Fields: {
      key: nFilename,
      "Content-Type": fileType,
    },
    Expires: 60, // seconds
  });

  res.json({
    ok: true,
    image,
    nFilename,
  });
}
