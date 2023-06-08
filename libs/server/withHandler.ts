import { NextApiRequest, NextApiResponse } from "next";
import { RequestHandler, Request, Response } from 'express';

type NextApiRequestCustom = 
  NextApiRequest &
  Request & {
    file?: any;
  };

type NextApiResponseCustom = 
  NextApiResponse & 
  Response;

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
}

type FN = (req: NextApiRequestCustom, res: NextApiResponseCustom) => void;

type method = "GET" | "POST" | "DELETE" | "PUT";

interface ConfigType {
  methods: method[];
  handler: FN;
  isPrivate?: boolean;
}

export default function withHandler({
  methods,
  isPrivate = true,
  handler,
}: ConfigType) {
  return async function (
    req: NextApiRequestCustom,
    res: NextApiResponseCustom
  ): Promise<any> {
    if (req.method && !methods.includes(req.method as any)) {
      return res.status(405).end();
    }
    if (isPrivate && !req.session.user) {
      return res.status(401).json({ ok: false, error: "로그인 해주세요" });
    }
    try {
      await handler(req, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  };
}
