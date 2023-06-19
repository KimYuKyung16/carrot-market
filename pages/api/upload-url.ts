import S3 from "aws-sdk/clients/s3";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const s3 = new S3({
    apiVersion: "2006-03-01",
  });

  const { file, fileType } = req.query;

  const product = await s3.createPresignedPost({
    Bucket: process.env.BUCKET_NAME,
    Fields: {
      key: file,
      "Content-Type": fileType,
    },
    Expires: 60, // seconds
    Conditions: [
      ["content-length-range", 0, 1048576], // up to 1 MB
    ],
  });

  res.json({
    ok: true,
    product,
  });
}
