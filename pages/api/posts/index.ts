import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "POST") {
    const {
      body: { question, latitude, longitude },
      session: { user },
    } = req;
    // create: 단일 레코드 생성, createMany: 여러 레코드 생성
    const post = await client.post.create({
      data: {
        question,
        latitude,
        longitude,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    res.json({
      ok: true,
      post,
    });
  }

  if (req.method === "GET") {
    const {
      query: { latitude, longitude },
    } = req;
    const parsedLatitude = parseFloat((latitude as string | string[]).toString());
    const parsedLongitude = parseFloat((longitude as string | string[]).toString());
    const posts = await client.post.findMany({ // POST 레코드를 반환
      include: { // 반환된 개체에 어떤 관계를 불러올지 지정
        user: {
          select: { // 반환 개체에 포함할 속성 지정 : USER에서 포함할 내용(id, name, avatar)
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: { // 관계가 있는 데이터의 개수 가져오기
          select: {
            wondering: true,
            answers: true,
          },
        },
      },
      where: {
        latitude: {
          gte: parsedLatitude - 0.01,
          lte: parsedLatitude + 0.01
        }, 
        longitude: {
          gte: parsedLongitude - 0.01,
          lte: parsedLongitude + 0.01
        }
      }
    });
    res.json({
      ok: true,
      posts,
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);
