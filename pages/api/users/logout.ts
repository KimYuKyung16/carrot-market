import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  await req.session.destroy();
  res.json({ ok: true });
}
export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
