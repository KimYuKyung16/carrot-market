import type { NextPage } from "next";
import Link from "next/link";
import Layout from "@components/layout";
import useSWR from "swr";
import { Chat } from "@prisma/client";
import useUser from "@libs/client/useUser";

interface ChatWithProduct extends Chat {
  product: { image: string; name: string; state: boolean };
  ChatMessage?: [{ message?: string }];
  buyer: { name: string };
  seller: { name: string };
}
interface ChatResponse {
  ok: boolean;
  chats: ChatWithProduct[];
}

const Chats: NextPage = () => {
  const { user, isLoading } = useUser();
  const { data } = useSWR<ChatResponse>(`/api/chats`);

  return (
    <Layout hasTabBar title="채팅">
      <div className="divide-y-[1px] ">
        {user && data?.chats.map((chat, i) => (
          <Link href={`/chats/${chat.id}`} key={i}>
            <a className="flex px-4 cursor-pointer py-3 items-center space-x-3">
              {chat.product.image ? (
                <img
                  src={chat.product.image}
                  className="w-12 h-12 rounded-full"
                  alt="제품 이미지"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-300" />
              )}

              <div>
                <div className="flex space-x-2 items-center">
                  <p className="text-gray-700">
                    {chat.buyerId === user?.id
                      ? chat.seller.name
                      : chat.buyer.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    <span className="text-orange-500">판매물품</span>
                    {` (${chat.product.name}) `}
                    {chat.product.state ? (
                      <span className="bg-orange-500 rounded-md text-white p-1 text-xs">
                        거래완료
                      </span>
                    ) : null}
                  </p>
                </div>
                <p className="text-sm  text-gray-500">
                  {chat.ChatMessage && chat.ChatMessage.length > 0
                    ? chat.ChatMessage[0].message
                    : "아직 대화가 없습니다"}
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
