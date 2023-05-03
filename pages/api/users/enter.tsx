import twilio from "twilio";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";


const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOEKN);

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const { phone, email } = req.body;
  const user = phone ? { phone } : email? { email } : null;
  if (!user) return res.status(400).json({ ok: false });
  const payload = Math.floor(100000 + Math.random() * 900000) + "";
  const token = await client.token.create({
    data: {
      payload,
      user: {
        connectOrCreate: {
          where: {
            ...user
          },
          create: {
            name: "Anonymous",
            ...user
          },
        }
      }
    }
  })
  if (phone) {
    // const message = await twilioClient.messages.create({
    //   messagingServiceSid: process.env.TWILIO_MSID,
    //   to: process.env.PHONE_NUMBER!,
    //   body: `Your login token is ${payload}.`,
    // })
    // console.log(message);
  } else if (email) {
    // 홈페이지 로그인 오류 먼저 해결하고 추후에 추가
  }
  return res.json({
    ok: true,
  })
}

export default withHandler({
  methods: ["POST"],
  handler, 
  isPrivate: false,
});
