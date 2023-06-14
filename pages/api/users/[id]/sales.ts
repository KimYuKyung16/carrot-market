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
  } = req;
  const sales = await client.product.findMany({
    where: {
      userId: +(id as string | string[]).toString(),
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
  res.json({
    ok: true,
    sales,
  });
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
