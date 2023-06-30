import client from "@libs/server/client";
// import withHandler, { ResponseType } from "@libs/server/withHandler";
import withHandler from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

export interface ResponseType {
  [key: string]: any;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const {
      query: { cursor },
    } = req;
    if (!cursor) {
      const products = await client.product.findMany({
        take: 20,
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
        // ok: true,

        products,
        cursor: products[products.length - 1].id,
      });
    } else {
      const products = await client.product.findMany({
        take: 20,
        skip: 1,
        cursor: {
          id: req.query.cursor ? +req.query.cursor : undefined,
        },
        include: {
          _count: {
            select: {
              favs: true,
              Chat: true,
            },
          },
        },
      });
      if (products.length) {
        res.json({
          products,
          cursor: products[products.length - 1].id,
        });
      } else {
        res.json({
          products: [],
          cursor: null,
        });
      }
    }
  }
  if (req.method === "POST") {
    const {
      session: { user },
      body: { file, name, price, description },
    } = req;
    const location = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file}`;
    const product = await client.product.create({
      data: {
        name,
        price: +price,
        description,
        image: location,
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
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);
