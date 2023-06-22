import type { NextPage } from "next";
import Layout from "@components/layout";
import Message from "@components/message";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useMutation from "@libs/client/useMutation";
import { Chat, ChatMessage, Product, User, Review } from "@prisma/client";
import useUser from "@libs/client/useUser";
import useSWR from "swr";
import { getDateTime } from "@libs/client/getDateTime";
import NotificationMessage from "@components/notificationMessage";
import { cls } from "@libs/client/utils";
import swal from "sweetalert";
import { useForm } from "react-hook-form";

interface ProductInfo {
  product: Product;
}

interface MessageResponse {
  ok: boolean;
  post: ChatMessage;
}

interface ReviewResponse {
  ok: boolean;
  review: Review;
}

interface MessageListWithUser extends ChatMessage {
  User: User;
  Chat: { product: { name: string } };
}

interface ChatWithProduct extends Chat {
  product: { name: string; id: string; state: string };
}

export interface MessageListResponse {
  ok: boolean;
  chatMessages: MessageListWithUser[];
  productName: ChatWithProduct;
}

interface ReviewForm {
  review: string;
}

const socket = io("https://kcarrotmarket.store", { transports: ["websocket"] });
const ChatDetail: NextPage = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<ReviewForm>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLInputElement>(null);
  const { user, isLoading } = useUser();
  const [saveMessage, { loading }] = useMutation<MessageResponse>(
    `/api/chats/${router.query.id}/message`,
    "POST"
  );
  const [saveReview, { loading: reviewLoading, data }] =
    useMutation<ReviewResponse>(`/api/chats/${router.query.id}/review`, "POST");
  const { data: messageList, mutate } = useSWR<MessageListResponse>( // 기존에 있던 메시지 리스트
    router.query.id ? `/api/chats/${router.query.id}/message` : null
  );
  const { data: productData } = useSWR<ProductInfo>(
    messageList?.productName.product.id
      ? `/api/products/${messageList?.productName.product.id}`
      : null
  );
  const [modal, setModal] = useState(true); // 거래 완료 모달창 상태
  const [reviewState, setReviewState] = useState("false"); // 리뷰창 상태
  const [reviewScore, setReviewScore] = useState(1); // 리뷰 점수
  const [existMessage, setExistMessage] = useState<any[]>([]); // 현재까지의 메세지 전체
  const [sendMessage, setSendMessage] = useState(""); // 보낼 메세지 내용

  const onValid = (data: { review: string }) => {
    if (loading) return;
    saveReview({
      review: data.review,
      createForId: productData?.product.userId,
      reviewScore,
    });
  };
  const onChangeSend = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSendMessage(e.target.value);
  };
  const onClickTransactionBtn = (): void => {
    if (loading) return;
    if (!productData?.product || productData?.product.state) {
      // 거래가 끝난 물품일 경우
      if (!productData?.product) return;
      swal("이미 거래가 끝난 물품입니다", "", "warning");
      return;
    }
    swal({
      title: "거래하시겠습니까?",
      text: "",
      icon: "warning",
      buttons: ["취소", "확인"],
      dangerMode: true,
    }).then((willAgree) => {
      if (willAgree) {
        socket.emit("message", {
          roomNum: router.query.id,
          message: {
            avatar: user?.avatar,
            name: user?.name,
            userId: user?.id,
            createdAt: new Date(),
            message: "거래를 완료하시겠습니까?",
            notification: true,
          },
        });
        saveMessage({
          chatId: router.query.id,
          message: "거래를 완료하시겠습니까?",
          notification: true,
        });
      } else {
        swal("거래를 취소했습니다");
      }
    });
  };
  // const onKeyPress = (e: any) => {
  //   console.log(e)
  //   e.preventdefault();
  //   if (e.key === 'Enter') {
  //     onClickSendBtn();
  //   }
  // }

  const onClickSendBtn = async () => {
    if ((!router.query.id && !user) || loading) {
      swal("메시지 전송에 실패했습니다.");
      return;
    }
    if (!sendRef.current) return;
    sendRef.current.value = "";
    saveMessage({ chatId: router.query.id, message: sendMessage });
    socket.emit("message", {
      roomNum: router.query.id,
      message: {
        avatar: user?.avatar,
        name: user?.name,
        userId: user?.id,
        createdAt: new Date(),
        message: sendMessage,
      },
    });
  };

  useEffect(() => {
    socket.on("send Message", (msg: any) => {
      setExistMessage((prev) => [
        ...prev,
        {
          User: { avatar: msg.avatar, name: msg.name },
          createdAt: msg.createdAt,
          message: msg.message,
          userId: msg.userId,
          notification: msg.notification,
        },
      ]);
    });
    socket.on("delete Message", (msg: any) => {
      setExistMessage(msg);
    });
    socket.on("review", (msg: any) => {
      if (user?.id === msg) {
        localStorage.setItem("reviewState", "true");
        setReviewState("true");
      }
    });

    return () => {
      socket.off("send Message");
      socket.off("delete Message");
      socket.off("review");
      socket.emit("leaveRoom", String(router.query.id));
      localStorage.removeItem("reviewState");
    };
  }, [user]);
  useEffect(() => {
    socket.emit("setRoomNum", router.query.id);
  }, [router]);
  useEffect(() => {
    // 스크롤 제일 아래로
    if (!scrollRef.current) return;
    const { scrollHeight } = scrollRef.current;
    window.scrollTo(0, scrollHeight); // 바로 이동
  }, [existMessage]);
  useEffect(() => {
    if (data?.ok) {
      localStorage.setItem("reviewState", "false");
      setReviewState("false");
    }
  }, [data]);
  useEffect(() => {
    if (!messageList?.chatMessages || messageList?.chatMessages.length === 0)
      return;
    setExistMessage([...messageList?.chatMessages]);
    mutate();
  }, [messageList]);
  useEffect(() => {
    let state = localStorage.getItem("reviewState");
    if (!state) return;
    setReviewState(state as string);
  });

  const preventClose = (e: BeforeUnloadEvent) => {
    localStorage.setItem("reviewState", "false");
  };
  useEffect(() => {
    (() => {
      window.addEventListener("beforeunload", preventClose);
    })();

    return () => {
      window.removeEventListener("beforeunload", preventClose);
    };
  }, []);
  const onClickEnter = (e: any) => {
    e.preventDefault();
    onClickSendBtn();
  };

  return (
    <>
      {reviewState === "true" ? (
        <div
          className={cls(
            "flex flex-col justify-center items-center fixed left-0 top-0 z-10 h-screen w-full bg-black/[0.7]",
            reviewState === "true" ? "" : "hidden"
          )}
        >
          <form
            onSubmit={handleSubmit(onValid)}
            className="bg-orange-500 w-10/12 max-w-xl h-full max-h-[500px] p-5"
          >
            <h1 className="text-gray-200 font-bold text-center text-xl pb-3">
              거래 후기를 남겨주세요
            </h1>
            <div className="flex h-1/6">
              {[1, 2, 3, 4, 5].map((star, i) => (
                <svg
                  key={star}
                  className={cls(
                    "h-full w-16",
                    reviewScore >= star ? "text-yellow-400" : "text-gray-400"
                  )}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  stroke="#000000"
                  onClick={() => {
                    setReviewScore(i + 1);
                  }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <textarea
              placeholder="후기 작성"
              className="w-full h-1/2 resize-none outline-none px-3 py-2"
              {...register("review", { required: true, minLength: 1 })}
            />
            <button className="w-full bg-orange-300 hover:bg-orange-400 text-white px-4 py-3 text-base border border-transparent rounded-md shadow-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:outline-none mb-2">
              등록
            </button>
            <button
              className="w-full bg-gray-400 hover:bg-gray-500 text-white px-4 py-3 text-base border border-transparent rounded-md shadow-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:outline-none"
              onClick={() => {
                localStorage.setItem("reviewState", "false");
                setReviewState("false");
              }}
            >
              취소
            </button>
          </form>
        </div>
      ) : null}
      {messageList?.productName.product.state && reviewState === "false" ? (
        <div
          onClick={() => {
            setModal(false);
          }}
          className={cls(
            "fixed left-0 top-0 z-10 h-screen w-screen  bg-black/[0.7]",
            modal ? "" : "hidden"
          )}
        >
          <p className="flex justify-center w-full bg-orange-500 text-white text-lg px-4 border border-transparent rounded-md shadow-sm font-medium py-5">
            판매 완료된 상품입니다
          </p>
        </div>
      ) : null}

      <Layout
        canGoBack
        title={messageList?.productName.product.name}
        chat={{
          onClickTranscation: onClickTransactionBtn,
          product_userId: productData?.product.userId,
        }}
      >
        <div ref={scrollRef} className="py-5 pb-16 px-4 space-y-4">
          {existMessage
            ? existMessage.map((message, i) => {
                let { year, month, day, hour, minute } = getDateTime(
                  message.createdAt
                );
                let dayState =
                  i >= 1 &&
                  getDateTime(existMessage[i - 1].createdAt).day === day;

                return message.notification ? (
                  <>
                    {!dayState ? (
                      <div className="flex justify-center">
                        <p className="shadow-md text-xs rounded-lg py-2 px-5 bg-orange-400 text-white text-center border-b-2 border-orange-300">{`${year}년 ${month}월 ${day}일`}</p>
                      </div>
                    ) : null}
                    <NotificationMessage
                      key={i}
                      message={message.message}
                      avatarUrl={message.User.avatar}
                      date={hour + ":" + minute}
                      name={message.User.name}
                      reversed={user?.id === message.userId}
                      senderId={message.userId}
                      productId={messageList?.productName.product.id}
                      existMessage={existMessage}
                      chatId={router.query.id}
                      existMessageIndex={i}
                    />
                  </>
                ) : (
                  <>
                    {!dayState ? (
                      <div className="flex justify-center">
                        <p className="shadow-md text-xs rounded-lg py-2 px-5 bg-orange-400 text-white text-center border-b-2 border-orange-300">{`${year}년 ${month}월 ${day}일`}</p>
                      </div>
                    ) : null}
                    <Message
                      key={i}
                      message={message.message}
                      avatarUrl={message.User.avatar}
                      date={hour + ":" + minute}
                      name={message.User.name}
                      reversed={user?.id === message.userId}
                    />
                  </>
                );
              })
            : null}

          <form
            onSubmit={onClickEnter}
            className="fixed py-2 bottom-0 inset-x-0 pb-5"
          >
            <div className="flex relative max-w-lg items-center h-9 w-full mx-auto border border-gray-300 rounded-md">
              <input
                ref={sendRef}
                onChange={onChangeSend}
                type="text"
                className="h-full px-2 shadow-sm rounded-full w-full border-gray-300 focus:ring-orange-500 focus:outline-none pr-12 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 flex py-1.5 pr-1.5 right-0">
                <input
                  type="button"
                  value="&rarr;"
                  onClick={onClickSendBtn}
                  className="flex focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center bg-orange-500 rounded-full px-3 hover:bg-orange-600 text-sm text-white"
                ></input>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
};

export default ChatDetail;
