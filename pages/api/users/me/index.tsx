import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";
import { RequestHandler, Request, Response } from "express";

import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";

type NextApiRequestWithImage = NextApiRequest &
  Request & {
    file?: any;
  };

type NextApiResponseWithImage = NextApiResponse & Response;

let s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "carrot-market",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key(req: any, file: any, cb: any) {
      cb(null, `profile/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function handler(
  req: NextApiRequestWithImage,
  res: NextApiResponseWithImage
) {
  if (req.method === "GET") {
    const profile = await client.user.findUnique({
      where: { id: req.session.user?.id },
    });
    res.json({
      ok: true,
      profile,
    });
  }
  if (req.method === "POST") {
    const {
      session: { user },
    } = req;

    upload.single("profileImage")(req, res, async () => {
      const {
        file,
        body: { email, phone, name },
      } = req;
      const currentUser = await client.user.findUnique({
        where: {
          id: user?.id,
        },
      });
      if (file) {
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            avatar: file.location,
          },
        });
      }
      if (email && email !== currentUser?.email) {
        const alreadyExists = Boolean(
          await client.user.findUnique({
            where: {
              email,
            },
            select: {
              id: true,
            },
          })
        );
        if (alreadyExists) {
          return res.json({
            ok: false,
            error: "존재하는 이메일입니다.",
          });
        }
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            email,
          },
        });
      }
      if (phone && phone !== currentUser?.phone) {
        const alreadyExists = Boolean(
          await client.user.findUnique({
            where: {
              phone,
            },
            select: {
              id: true,
            },
          })
        );
        if (alreadyExists) {
          return res.json({
            ok: false,
            error: "존재하는 전화번호입니다.",
          });
        }
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            phone,
          },
        });
      }
      if (name) {
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            name,
          },
        });
      }
    });

    res.json({ ok: true });
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);

export const config = {
  api: {
    bodyParser: false,
  },
};
