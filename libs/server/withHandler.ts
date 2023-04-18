import { NextApiRequest, NextApiResponse } from "next";

type FN = (req: NextApiRequest, res: NextApiResponse) => void;


export default function withHandler(
  method: "GET"|"POST"|"DELETE",
  fn: FN
) {
  return async function(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== method)  {
      return res.status(405).end();
    }
    try {
      await fn(req, res);
    } catch(error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
}