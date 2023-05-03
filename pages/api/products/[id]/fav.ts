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
    session: { user },
  } = req;
  const alreadyExists = await client.fav.findFirst({
    where: {
      productId: +(id as string | string[]).toString(),
      userId: user?.id,
    },
  });
  if (alreadyExists) { // 좋아요 삭제
    await client.fav.delete({
      where: {
        id: alreadyExists.id
      }
    })
  } else { // 좋아요 생성
    await client.fav.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          }
        },
        product: {
          connect: {
            id: +(id as string | string[])?.toString()
          }
        }
        
      }
    })
  }
  res.json({ ok: true });
}

export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
