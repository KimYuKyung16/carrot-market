import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
    session: { user },
  } = req;
  if (req.method === "POST") {
    const {
      body: { answer },
    } = req;

    const Answer = await client.answer.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
        post: {
          connect: {
            id: +(id as string | string[]).toString(),
          },
        },
        answer,
      },
    });
    res.json({
      ok: true,
      answer: Answer,
    });
  }
  if (req.method === "PUT") {
    const {
      body: { id, answer },
    } = req;
    const updateAnswer = await client.answer.update({
      where: {
        id,
      },
      data: {
        answer,
      },
    });
    res.json({
      ok: true,
    });
  }
  if (req.method === "DELETE") {
    const {
      body: { id },
    } = req;
    const deleteAnswer = await client.answer.delete({
      where: {
        id,
      },
    });
    res.json({
      ok: true,
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["POST", "PUT", "DELETE"],
    handler,
  })
);
