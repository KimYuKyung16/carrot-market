import type { NextPage } from "next";
import Layout from "@components/layout";
import Message from "@components/message";
import useSWR from "swr";
import { useRouter } from "next/router";
import { Stream } from "@prisma/client";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import { getDateTime } from "@libs/client/getDateTime";

interface StreamMessage {
  message: string;
  id: number;
  createdAt: string;
  user: {
    avatar?: string;
    id: number;
    name: string;
  };
}

interface StreamWithMessages extends Stream {
  messages: StreamMessage[];
}

interface StreamResponse {
  ok: true;
  stream: StreamWithMessages;
}

interface MessageForm {
  message: string;
}

const Streams: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<MessageForm>();
  const { data, mutate } = useSWR<StreamResponse>(
    router.query.id ? `/api/streams/${router.query.id}` : null,
    {
      refreshInterval: 1000,
    }
  );
  const [sendMessage, { loading, data: sendMessageData }] = useMutation(
    `/api/streams/${router.query.id}/messages`,
    "POST"
  );
  const onValid = (form: MessageForm) => {
    if (loading) return;
    reset();
    mutate(
      (prev) =>
        prev &&
        ({
          ...prev,
          stream: {
            ...prev.stream,
            messages: [
              ...prev.stream.messages,
              {
                id: Date.now(),
                message: form.message,
                user: {
                  ...user,
                },
              },
            ],
          },
        } as any),
      false
    );
    sendMessage(form);
  };
  return (
    <Layout canGoBack>
      <div className="py-10 px-4  space-y-4">
        {data?.stream.cloudflareId ? (
          <div className="h-0 w-full aspect-w-16 aspect-h-9">
            <iframe
              src={`https://customer-qkzviq88w8n4p4hm.cloudflarestream.com/${data?.stream.cloudflareId}/iframe`}
              className="w-full aspect-video rounded-md shadow-sm"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen={true}
            ></iframe>
          </div>
        ) : (
          <div className="h-0 w-full aspect-w-16 aspect-h-9 bg-gray-300"></div>
        )}
        <div className="mt-5">
          <h1 className="text-3xl font-bold text-gray-900">
            {data?.stream?.name}
          </h1>
          <span className="text-2xl block mt-3 text-gray-900">
            {data?.stream?.price} 원
          </span>
          <p className="my-6 text-gray-700">{data?.stream?.description}</p>
          {data?.stream.cloudflareUrl && data?.stream.cloudflareKey ? (
            <div className="flex flex-col space-y-2 rounded-md text-gray-800 bg-orange-500 overflow-x-auto p-4 no-scrollbar">
              <span className="font-extrabold">
                스트리밍 키 (타인에게 공유 금지)
              </span>
              <span>
                <span className="font-extrabold mr-2">Url:</span>
                <span className="font-bold text-orange-100">
                  {data?.stream.cloudflareUrl}
                </span>
              </span>
              <span>
                <span className="font-extrabold mr-2">Key:</span>
                <span className="font-bold text-orange-100">
                  {data?.stream.cloudflareKey}
                </span>
              </span>
            </div>
          ) : null}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Chat</h2>
          <div className="py-10 pb-16 h-[50vh] overflow-y-auto  px-4 space-y-4">
            {data?.stream.messages.map((message, i) => {
              let dayState = true;
              let { year, month, day, hour, minute } = getDateTime(
                message.createdAt
              );
              dayState = 
              i >= 1 &&
              getDateTime(data?.stream.messages[i - 1].createdAt).day === day;
    
              return (
                <div key={message.id}>
                  {!dayState && message.createdAt ? (
                    <div className="flex justify-center">
                      <p className="shadow-md text-xs rounded-lg py-2 px-5 bg-orange-400 text-white text-center border-b-2 border-orange-300">{`${year}년 ${month}월 ${day}일`}</p>
                    </div>
                  ) : null}
                  <Message
                    message={message.message}
                    avatarUrl={message.user.avatar}
                    reversed={message.user.id === user?.id}
                    date={hour ? hour + ":" + minute : null}
                    name={message.user.name}
                  />
                </div>
              );
            })}
          </div>
          <div className="fixed py-2 bg-white bottom-0 inset-x-0 pb-5">
            <form
              onSubmit={handleSubmit(onValid)}
              className="flex relative max-w-lg items-center h-9 w-full mx-auto border border-gray-300 rounded-md"
            >
              <input
                type="text"
                {...register("message", { required: true })}
                className="h-full px-2 shadow-sm rounded-full w-full border-gray-300 focus:ring-orange-500 focus:outline-none pr-12 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 flex py-1.5 pr-1.5 right-0">
                <button className="flex focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center bg-orange-500 rounded-full px-3 hover:bg-orange-600 text-sm text-white">
                  &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Streams;
