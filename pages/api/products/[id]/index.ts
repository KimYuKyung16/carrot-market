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

let s3 = new S3Client({});

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
  const {
    query: { id },
    session: { user },
  } = req;
  if (req.method === "GET") {
    const product = await client.product.findUnique({
      where: {
        id: +(id as string | string[]).toString(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        Chat: {
          select: {
            id: true,
            buyerId: true,
          },
          where: {
            buyerId: user?.id,
          },
        },
      },
    });
    const terms = product?.name.split(" ").map((word) => ({
      name: {
        contains: word,
      },
    }));
    const relatedProducts = await client.product.findMany({
      where: {
        OR: terms,
        AND: {
          id: {
            not: product?.id,
          },
        },
      },
    });
    const isLiked = Boolean(
      await client.fav.findFirst({
        where: {
          productId: product?.id,
          userId: user?.id,
        },
        select: {
          id: true,
        },
      })
    );
    res.json({ ok: true, product, isLiked, relatedProducts });
  }
  if (req.method === "PUT") {
    upload.single("productImage")(req, res, async () => {
      const {
        file,
        body: { name, price, description },
      } = req;
      if (file) {
        await client.product.update({
          where: {
            id: +(id as string | string[]).toString(),
          },
          data: {
            image: file.location,
            name,
            price: +price,
            description,
          },
        });
        res.json({
          ok: true,
        });
      } else {
        await client.product.update({
          where: {
            id: +(id as string | string[]).toString(),
          },
          data: {
            name,
            price: +price,
            description,
          },
        });
      }
      res.json({
        ok: true,
      });
    });
  }
  if (req.method === "DELETE") {
    const product = await client.product.delete({
      where: {
        id: +(id as string | string[]).toString(),
      },
    });
    res.json({
      ok: true,
    });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET", "DELETE", "PUT"],
    handler,
  })
);

export const config = {
  api: {
    bodyParser: false,
  },
};
