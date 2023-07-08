import type { NextPage } from "next";
import Button from "@components/button";
import Layout from "@components/layout";
import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import { Product, User } from "@prisma/client";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import { useEffect } from "react";
import { Chat } from "@prisma/client";
import useUser from "@libs/client/useUser";
import swal from "sweetalert";
import Image from "next/image";

interface ProductWithUser extends Product {
  user: User;
  Chat: [{ id: number; buyerId: string }];
}

export interface ItemDetailResponse {
  ok: boolean;
  product: ProductWithUser;
  relatedProducts: Product[];
  isLiked: boolean;
}

interface ChatResponse {
  ok: boolean;
  chat: Chat;
}

interface DeleteProductResponse {
  ok: boolean;
}

const ItemDetail: NextPage = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { data, mutate } = useSWR<ItemDetailResponse>(
    router.query.id ? `/api/products/${router.query.id}` : null
  );
  const [toggleFav] = useMutation(
    `/api/products/${router.query.id}/fav`,
    "POST"
  );
  const [createChat, { loading, data: chatData }] = useMutation<ChatResponse>(
    `/api/chats`,
    "POST"
  );
  const [deleteProduct, { data: deleteData, loading: deleteLoading }] =
    useMutation<DeleteProductResponse>(
      `/api/products/${router.query.id}`,
      "DELETE"
    );
  const onDeleteClick = () => {
    if (deleteLoading) return;
    swal({
      title: "정말 삭제하시겠습니까?",
      text: "삭제 시 관련 채팅 및 판매내역도 삭제됩니다",
      icon: "warning",
      buttons: true as unknown as undefined,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("성공적으로 삭제되었습니다.", {
          icon: "success",
        });
        deleteProduct("");
      }
    });
  };
  const onFavoriteClick = () => {
    toggleFav({});
    if (!data) return;
    mutate({ ...data, isLiked: !data.isLiked }, false);
  };
  const onChatClick = () => {
    if (loading || isLoading) return;
    if (data?.product.userId === user?.id) {
      // 본인이 등록한 상품일 경우
      router.push(`/chats`);
      return;
    }
    if (data?.product.Chat && data?.product.Chat.length >= 1) {
      // 이미 채팅방이 있을 경우
      router.push(`/chats/${data.product.Chat[0].id}`);
      return;
    }
    if (data?.product.state) {
      // 거래가 완료된 물품일 경우
      swal("이미 거래가 끝난 물품입니다", "", "warning");
      return;
    }
    createChat({ productId: data?.product.id, sellerId: data?.product.userId });
  };
  useEffect(() => {
    // !data로 바꾸면 삭제되지 않은 물품을 보려고할 때도 router.back처리됨.
    if (data && !data?.product) {
      router.back();
    }
  }, [data]);
  useEffect(() => {
    if (chatData && chatData.ok) {
      router.push(`/chats/${chatData.chat.id}`);
    }
  }, [chatData]);
  useEffect(() => {
    if (deleteData && deleteData?.ok) {
      router.back();
    }
  }, [deleteData]);
  useEffect(() => {
    mutate();
  }, [data?.product]);

  return (
    <Layout canGoBack>
      {data && data.product ? (
        <div className="px-4  py-4">
          <div className="mb-8">
            {data?.product.image ? (
              <div className="w-full h-0 aspect-w-16 aspect-h-9">
                <Image
                  priority={true}
                  loader={() => {
                    return data.product.image + "?w=100%";
                  }}
                  src={data.product.image}
                  className="w-full aspect-video"
                  placeholder="blur"
                  blurDataURL={data.product.image}
                  layout="fill"
                />
              </div>
            ) : (
              <div className="h-0 w-full aspect-w-16 aspect-h-9" />
            )}

            <div className="flex cursor-pointer py-3 border-t border-b items-center space-x-3">
              {data?.product.user.avatar ? (
                <img
                  src={data.product.user.avatar}
                  className="w-12 h-12 rounded-full bg-slate-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-300" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {data?.product?.user?.name}
                </p>
                <Link href={`/users/profiles/${data?.product?.user?.id}`}>
                  <a className="text-xs font-medium text-gray-500">
                    View profile &rarr;
                  </a>
                </Link>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between items-start">
                <h1 className="flex items-center flex-wrap text-3xl font-bold text-gray-900">
                  {data?.product?.name}
                  {data?.product.state ? (
                    <span className="bg-orange-400 text-white text-base font-normal rounded-md px-2 py-1  ml-1">
                      거래완료
                    </span>
                  ) : null}
                </h1>
                {user && data?.product.userId === user.id ? (
                  <div className="flex space-x-2 justify-between w-14 mr-3 text-sm text-gray-500 whitespace-nowrap">
                    <button
                      onClick={() => {
                        router.push(`/products/${data.product.id}/edit`);
                      }}
                    >
                      수정
                    </button>
                    <button onClick={onDeleteClick}>삭제</button>
                  </div>
                ) : null}
              </div>
              <span className="text-2xl block mt-3 text-gray-900">
                {data?.product?.price} 원
              </span>
              <p className=" my-6 text-gray-700">
                {data?.product?.description}{" "}
              </p>
              <div className="flex items-center justify-between space-x-2">
                <Button onClick={onChatClick} large text="Talk to seller" />
                <button
                  onClick={onFavoriteClick}
                  className={cls(
                    "p-3 rounded-md flex items-center hover: bg-gray-100 justify-center",
                    data?.isLiked
                      ? "text-red-500 hover:text-red-600"
                      : "text-gray-400 hover:text-gray-500"
                  )}
                >
                  {data?.isLiked ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Similar items</h2>
            <div className=" mt-6 grid grid-cols-2 gap-4">
              {data?.relatedProducts.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div>
                    {product.image ? (
                      <img
                        src={product.image}
                        className="h-56 w-full mb-4 bg-slate-300"
                      />
                    ) : (
                      <div className="h-56 w-full mb-4 bg-slate-300" />
                    )}
                    <h3 className="text-gray-700 -mb-1">{product.name}</h3>
                    <span className="text-sm font-medium text-gray-900">
                      {product.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default ItemDetail;
