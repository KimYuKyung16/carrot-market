import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  console.log(req.method)
  if (req.method === "GET") { // 커뮤니티 글 상세사항을 불러오고 싶을 경우
    const {
      query: { id },
      session: { user },
    } = req;
    const post = await client.post.findUnique({
      where: {
        id: +(id as string | string[]).toString(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        answers: {
          select: {
            answer: true,
            id: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            answers: true,
            wondering: true,
          },
        },
      },
    });
    const isWondering = Boolean(
      await client.wondering.findFirst({
        where: {
          postId: +(id as string | string[]).toString(),
          userId: user?.id,
        },
        select: {
          id: true,
        },
      })
    );

    res.json({
      ok: true,
      post,
      isWondering,
    });
  }

  if (req.method === "DELETE") { // 커뮤니티 글 상세사항을 삭제하고 싶을 경우
    const {
      query: { id },
    } = req;

    const post = await client.post.delete({
      where: {
        id: +(id as string | string[]).toString(),
      },
    })

    res.json({
      ok: true,
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "DELETE"],
    handler,
  })
);
