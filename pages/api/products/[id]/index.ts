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
  if (req.method === "GET") {
    const product = await client.product.findUnique({
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
        Chat: {
          select: {
            id: true,
            buyerId: true,
          },
          where: {
            buyerId: user?.id,
          },
        },
      },
    });
    const terms = product?.name.split(" ").map((word) => ({
      name: {
        contains: word,
      },
    }));
    const relatedProducts = await client.product.findMany({
      take: 6,
      where: {
        OR: terms,
        AND: {
          id: {
            not: product?.id,
          },
        },
      },
    });
    const isLiked = Boolean(
      await client.fav.findFirst({
        where: {
          productId: product?.id,
          userId: user?.id,
        },
        select: {
          id: true,
        },
      })
    );
    res.json({ ok: true, product, isLiked, relatedProducts });
  }
  if (req.method === "PUT") {
    const {
      body: { file, name, price, description },
    } = req;
    if (file) {
      const location = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file}`;
      await client.product.update({
        where: {
          id: +(id as string | string[]).toString(),
        },
        data: {
          image: location,
          name,
          price: +price,
          description,
        },
      });
      res.json({
        ok: true,
      });
    } else {
      await client.product.update({
        where: {
          id: +(id as string | string[]).toString(),
        },
        data: {
          name,
          price: +price,
          description,
        },
      });
    }

    res.json({
      ok: true,
    });
  }
  if (req.method === "DELETE") {
    const product = await client.product.delete({
      where: {
        id: +(id as string | string[]).toString(),
      },
    });
    res.json({
      ok: true,
    });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET", "DELETE", "PUT"],
    handler,
  })
);