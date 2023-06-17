import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import { cls } from "@libs/client/utils";
import { ChatMessage, Message, Product, User } from "@prisma/client";
import { io } from "socket.io-client";
import useSWR from "swr";
import swal from "sweetalert";
import { useEffect } from "react";
import { MessageListResponse } from "pages/chats/[id]";

interface ProductInfo {
  product: Product;
}

interface message extends Message {
  User: User;
}

interface NotificationMessageProps {
  message: string;
  avatarUrl?: string | null;
  date: string;
  name: string;
  reversed?: boolean;
  senderId: number;
  productId?: string;
  existMessage: message[];
  chatId?: string | string[];
  existMessageIndex: number;
}

interface MessageResponse {
  ok: boolean;
  post: ChatMessage;
}

interface ProductResponse {
  ok: boolean;
}

const socket = io("kcarrotmarket.store:5000", { transports: ['websocket'] });
export default function NotificationMessage({
  message,
  avatarUrl,
  date,
  name,
  reversed,
  senderId,
  productId,
  existMessage,
  chatId,
  existMessageIndex,
}: NotificationMessageProps) {
  const { user, isLoading } = useUser();
  const { data: messageList, mutate } = useSWR<MessageListResponse>( // 기존에 있던 메시지 리스트
    chatId ? `/api/chats/${chatId}/message` : null
  );
  const [saveMessage, { loading }] = useMutation<MessageResponse>( // 채팅 저장
    `/api/chats/${chatId}/message`,
    "POST"
  );
  const [updateProductState, { loading: updateLoading }] =
    useMutation<ProductResponse>(
      productId ? `/api/products/${productId}/state` : "",
      "PUT"
    );
  const [savePurchase, { loading: purchaseLoading }] =
    useMutation<MessageResponse>(`/api/chats/${chatId}/purchases`, "POST");
  const { data: productData } = useSWR<ProductInfo>( // 제품 정보
    productId ? `/api/products/${productId}` : null
  );
  const [deleteMessage, { loading: deleteLoading }] = // 채팅 삭제
    useMutation<ProductResponse>(
      chatId ? `/api/chats/${chatId}/message` : "",
      "DELETE"
    );
  const sendNotification = (notificationMessage: string) => {
    if (loading || updateLoading || isLoading || !productId || !chatId) return;
    if (!productData?.product || productData?.product.state) {
      // 거래가 끝난 물품일 경우
      if (!productData?.product) return;
      swal("이미 거래가 끝난 물품입니다", "", "warning");
      return;
    }
    if (senderId === user?.id) {
      // 본인 물품일 경우
      swal("본인이 거래를 완료할 수 없습니다", "", "warning");
      return;
    }
    socket.emit("message", {
      roomNum: chatId,
      message: {
        avatar: user?.avatar,
        name: user?.name,
        userId: user?.id,
        createdAt: new Date(),
        message: notificationMessage,
        notification: true,
      },
    });
    saveMessage({
      chatId: chatId,
      message: notificationMessage,
      notification: true,
    });
    if (notificationMessage === "거래가 완료되었습니다") {
      if (!productId) return;
      updateProductState({ productId }); // 제품 거래 여부
      savePurchase({ productId }); // 구매내역 추가
    }
  };
  const onClickCancel = () => {
    if (loading || updateLoading || isLoading || deleteLoading || !chatId)
      return;
    if (!productData?.product || productData?.product.state) {
      // 거래가 끝난 물품일 경우
      if (!productData?.product) return;
      swal("이미 거래가 끝난 물품입니다", "", "warning");
      return;
    }

    if (!messageList || !messageList.chatMessages[existMessageIndex]) return;
    deleteMessage({ id: messageList.chatMessages[existMessageIndex].id });

    let nexistMessage = [...existMessage];
    nexistMessage.splice(existMessageIndex, 1);
    socket.emit("deleteMessage", {
      roomNum: chatId,
      message: nexistMessage,
    });
  };

  useEffect(() => {
    mutate();
  }, [existMessage]);

  return (
    <div
      className={cls(
        "flex items-start",
        reversed ? "flex-row-reverse space-x-reverse" : "space-x-2"
      )}
    >
      <div className="flex-col space-y-1 w-full">
        <div
          className={cls(
            "flex gap-3 text-xs",
            reversed ? "flex-row-reverse" : ""
          )}
        >
          <p className="whitespace-pre">{name}</p>
          <p className="text-gray-500 whitespace-pre">{date}</p>
        </div>
        <div
          className={cls(
            "flex gap-2 w-full",
            reversed ? "flex-row-reverse" : ""
          )}
        >
          {avatarUrl ? (
            <img src={avatarUrl} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-400" />
          )}

          <div className="flex flex-col space-y-3 items-center w-3/4 text-base text-white p-3 bg-orange-500 border-2 border-orange-500 rounded-md">
            {message === "거래가 취소되었습니다" ||
            message === "거래가 완료되었습니다" ? null : (
              <img className="h-20" src="/carrot.png" alt="carrot_icon" />
            )}
            <p className="text-lg font-semibold">{message}</p>
            {message === "거래가 취소되었습니다" ||
            message === "거래가 완료되었습니다" ? null : (
              <div className="flex flex-col w-full space-y-2">
                <div className="flex justify-center space-x-3 w-full">
                  <button
                    onClick={() => {
                      sendNotification("거래가 완료되었습니다");
                    }}
                    className="font-extrabold w-1/2 bg-white border-2 text-orange-500 border-white py-1 px-3 hover:bg-gray-100 rounded-md shadow-sm"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => {
                      sendNotification("거래가 취소되었습니다");
                    }}
                    className="font-extrabold  w-1/2 border-2 border-white py-1 px-3 hover:bg-orange-600 rounded-md shadow-sm"
                  >
                    거절
                  </button>
                </div>
                {user?.id === senderId ? (
                  <button
                    onClick={onClickCancel}
                    className="font-extrabold w-full bg-yellow-100 border-2 text-orange-500 border-yellow-100 py-1 px-3 hover:bg-yellow-200 rounded-md shadow-sm"
                  >
                    취소하기
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
