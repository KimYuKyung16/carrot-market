import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import { cls } from "@libs/client/utils";
import { ChatMessage, Message, Product, User } from "@prisma/client";
import { io } from "socket.io-client";
import useSWR from "swr";
import swal from 'sweetalert';

interface ProductInfo {
  product: Product;
}

interface message extends Message {
  User: User;
}

interface NotificationMessageProps {
  message: string;
  reversed?: boolean;
  avatarUrl?: string | null;
  date: string;
  name: string;
  senderId: number;
  productId?: string;
  existMessage: message[];
  chatId?: string | string[];
}

interface MessageResponse {
  ok: boolean;
  post: ChatMessage;
}

interface ProductResponse {
  ok: boolean;
}

const socket = io("http://localhost:5000");
export default function NotificationMessage({
  message,
  avatarUrl,
  date,
  name,
  reversed,
  senderId,
  productId,
  chatId,
}: NotificationMessageProps) {
  const { user, isLoading } = useUser();
  const [saveMessage, { loading }] = useMutation<MessageResponse>(
    `/api/chats/${chatId}/message`,
    "POST"
  );
  const [updateProductState, { loading: updateLoading }] =
    useMutation<ProductResponse>(
      productId ? `/api/products/${productId}/state` : "",
      "PUT"
    );
  const { data: productData } = useSWR<ProductInfo>(
    productId ? `/api/products/${productId}` : null
  );

  const sendNotification = (notificationMessage: string) => {
    if (loading || updateLoading || isLoading || !productId || !chatId) return;
    if (!productData?.product || productData?.product.state) {
      // 거래가 끝난 물품일 경우
      if (!productData?.product) return;
      swal("이미 거래가 끝난 물품입니다", "", 'warning');
      return;
    }
    if (senderId === user?.id) {
      // 본인 물품일 경우
      alert("본인이 거래를 완료할 수 없습니다");
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
      updateProductState({
        productId,
      });
    }
  };

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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
