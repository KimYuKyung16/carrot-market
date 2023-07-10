import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id, cursor },
  } = req;
  if (!cursor) {
    const reviews = await client.review.findMany({
      take: 10,
      where: {
        createdForId: +(id as string | string[]).toString(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    res.json({
      ok: true,
      reviews,
      cursor: reviews.length > 0 ? reviews[reviews.length - 1].id : null,
    });
  } else {
    const reviews = await client.review.findMany({
      take: 10,
      skip: 1,
      cursor: {
        id: +cursor,
      },
      where: {
        createdForId: +(id as string | string[]).toString(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    if (reviews.length) {
      res.json({
        reviews,
        cursor: reviews[reviews.length - 1].id,
        ok: true,
      });
    } else {
      res.json({
        reviews: [],
        cursor: null,
        ok: true,
      });
    }
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
