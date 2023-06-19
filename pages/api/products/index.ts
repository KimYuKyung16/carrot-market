import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
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