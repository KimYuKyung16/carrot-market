import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";
import { RequestHandler, Request, Response } from "express";

import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

type NextApiRequestWithImage = NextApiRequest &
  Request & {
    file?: any;
  };

type NextApiResponseWithImage = NextApiResponse & Response;

let s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "carrot-market",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key(req: any, file: any, cb: any) {
      cb(null, `product/${Date.now()}_${file.originalname}`);
    },
  }),
});

async function handler(
  req: NextApiRequestWithImage,
  res: NextApiResponseWithImage
) {
  if (req.method === "GET") {
    const products = await client.product.findMany({
      include: {
        _count: {
          select: {
            favs: true,
            Chat: true,
          },
        },
      },
    });
    res.json({
      ok: true,
      products,
    });
  }
  if (req.method === "POST") {
    const {
      session: { user },
    } = req;

    upload.single("productImage")(req, res, async () => {
      const {
        file,
        body: { name, price, description },
      } = req;

      const product = await client.product.create({
        data: {
          name,
          price: +price,
          description,
          image: file.location,
          user: {
            connect: {
              id: user?.id,
            },
          },
        },
      });
      res.json({
        ok: true,
        product,
      });
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);

export const config = {
  api: {
    bodyParser: false,
  },
};
