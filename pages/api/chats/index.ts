import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "POST") {
    const {
      body: { productId, sellerId },
      session: { user },
    } = req;

    console.log(productId, sellerId);

    const chat = await client.chat.create({
      data: {
        product: {
          connect: {
            id: productId,
          },
        },
        seller: {
          connect: {
            id: sellerId,
          },
        },
        buyer: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    res.json({
      ok: true,
      chat,
    });
  }

  if (req.method === "GET") {
    const {
      session: { user },
    } = req;
    const chats = await client.chat.findMany({
      include: {
        product: {
          select: {
            image: true,
            name: true,
          },
        },
      },
      where: {
        buyerId: user?.id,
      },
    });
    res.json({
      ok: true,
      chats,
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);
