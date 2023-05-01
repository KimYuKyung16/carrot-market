import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const { token } = req.body;
  const foundtoken = await client.token.findUnique({
    where: {
      payload: token,
    },
  })
  if(!foundtoken) return res.status(404).end();
  req.session.user = {
    id: foundtoken.userId,
  } 
  await req.session.save();
  await client.token.deleteMany({
    where: {
      userId: foundtoken.userId,
    }
  })
  res.json({ ok: true });
}
export default withApiSession(withHandler("POST", handler));
