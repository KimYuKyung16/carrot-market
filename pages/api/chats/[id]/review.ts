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
      body: { review, createForId, reviewScore },
      session: { user },
    } = req;

    const addReview = await client.review.create({
      data: {
        review,
        score: reviewScore,
        createdBy: {
          connect: {
            id: user?.id,
          },
        },
        createdFor: {
          connect: {
            id: +createForId,
          },
        },
      },
    });
    res.json({
      ok: true,
      addReview,
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
