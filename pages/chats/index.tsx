import type { NextPage } from "next";
import Link from "next/link";
import Layout from "@components/layout";
import useSWR from "swr";
import { Chat } from "@prisma/client";

export interface ChatWithProduct extends Chat {
  product: { image: string; name: string };
}

interface ChatResponse {
  ok: boolean;
  chats: ChatWithProduct[];
}

const Chats: NextPage = () => {
  const { data } = useSWR<ChatResponse>(`/api/chats`);

  return (
    <Layout hasTabBar title="채팅">
      <div className="divide-y-[1px] ">
        {data?.chats.map((chat, i) => (
          <Link href={`/chats/${chat.id}`} key={i}>
            <a className="flex px-4 cursor-pointer py-3 items-center space-x-3">
              {chat.product.image ? (
                <img
                  src={chat.product.image}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-300" />
              )}

              <div>
                <p className="text-gray-700">{chat.product.name}</p>
                <p className="text-sm  text-gray-500">
                  See you tomorrow in the corner at 2pm!
                </p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default Chats;
