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
            state: true,
          },
        },
        ChatMessage: {
          select: {
            message: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        buyer: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            name: true,
          },
        },
      },
      where: {
        OR: [{ buyerId: user?.id }, { sellerId: user?.id }],
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
