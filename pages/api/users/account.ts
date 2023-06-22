import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const { phone, email } = req.body;

  const existAccount = await client.user.findMany({
    where: {
      OR: [{ phone }, { email }],
    },
  });
  if (existAccount.length >= 1) return res.status(400).json({ ok: false, error: "이미 존재하는 회원입니다" });

  const user = phone ? { phone } : email? { email } : null;
  if (!user) return res.status(400).json({ ok: false });

  const account = await client.user.create({
    data: {
      ...user,
      name: 'Anonymous',
    }
  })

  return res.json({
    ok: true,
  })
} 

export default withHandler({
  methods: ["POST"],
  handler, 
  isPrivate: false,
});
