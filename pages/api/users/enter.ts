import twilio from "twilio";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOEKN);

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
    const { phone, email } = req.body;
    const existAccount = await client.user.findMany({
      where: {
        OR: [{ phone }, { email }],
      },
    });
    if (existAccount.length === 0) return res.status(400).json({ ok: false, error: "회원정보가 없습니다" });

    const user = phone ? { phone } : email? { email } : null;
    if (!user) return res.status(400).json({ ok: false });

    const payload = Math.floor(100000 + Math.random() * 900000) + "";
    const token = await client.token.create({
      data: {
        payload,
        user: {
          connect: {
            ...user
          }
        }
      }
    })
    if (phone) {
      await twilioClient.messages.create({
        messagingServiceSid: process.env.TWILIO_MSID,
        to: process.env.PHONE_NUMBER!,
        body: `Your login token is ${payload}.`,
      })
    }
    return res.json({
      ok: true,
      token: token.payload,
      email
    })
} 

export default withHandler({
  methods: ["POST"],
  handler, 
  isPrivate: false,
});
