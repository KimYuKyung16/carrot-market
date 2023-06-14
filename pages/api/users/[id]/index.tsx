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
  const user = await client.user.findUnique({
    where: {
      id: +(id as string | string[]).toString(),
    },
  });
  res.json({
    ok: true,
    user,
  });
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
