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
      body: { chatId, message },
      session: { user },
    } = req;

    const chat = await client.chatMessage.create({
      data: {
        message,
        Chat: {
          connect: {
            id: +chatId,
          },
        },
        User: {
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
      query: { id },
    } = req;

    const productName = await client.chat.findUnique({
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      where: {
        id: +(id as string | string[]).toString(),
      },
    });
    const chatMessages = await client.chatMessage.findMany({
      include: {
        User: {
          select: {
            avatar: true,
            name: true,
          },
        },
      },
      where: {
        chatId: +(id as string | string[]).toString(),
      },
    });
    res.json({
      ok: true,
      chatMessages,
      productName,
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);
