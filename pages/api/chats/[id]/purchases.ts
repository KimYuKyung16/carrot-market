import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
    body: { productId },
  } = req;
  const productInfo = await client.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (productInfo) {
    const purchase = await client.purchase.create({
      data: {
        productName: productInfo.name,
        productPrice: productInfo.price,
        productImage: productInfo.image,
        user: {
          connect: {
            id: user?.id,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });
  }
  res.json({ ok: true });
}

export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
