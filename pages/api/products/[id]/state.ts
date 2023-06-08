import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { productId },
    session: { user },
  } = req;

  const updateProduct = await client.product.update({
    where: {
      id: +(productId as string | string[]).toString(),
    },
    data: {
      state: true,
    },
  });

  res.json({ ok: true });
}

export default withApiSession(
  withHandler({
    methods: ["PUT"],
    handler,
  })
);
