import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  console.log("test")
  const {
    session: { user },
  } = req;
  const sales = await client.product.findMany({
    where: {
      userId: user?.id,
      state: true
    },
    include: {
      _count: {
        select: {
          favs: true,
          Chat: true,
        },
      },
    },
  })
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
