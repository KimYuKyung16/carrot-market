import type { NextPage } from "next";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Answer, Post, User } from "@prisma/client";
import Link from "next/link";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import useUser from "@libs/client/useUser";
import swal from "sweetalert";
import { getDateTime } from "@libs/client/getDateTime";
import getTodayDateTime from "@libs/client/getToday";

interface AnswerWithUser extends Answer {
  user: User;
}

interface PostWithUser extends Post {
  user: User;
  _count: {
    answers: number;
    wondering: number;
  };
  answers: AnswerWithUser[];
}

export interface CommunityPostResponse {
  ok: boolean;
  post: PostWithUser;
  isWondering: boolean;
}

interface AnswerForm {
  answer: string;
  id: number;
  [key: string]: any;
}

interface AnswerResponse {
  ok: boolean;
  reponse: Answer;
}

interface DeletePostResponse {
  ok: boolean;
}

const CommunityPostDetail: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { register, handleSubmit, reset } = useForm<AnswerForm>();
  const {
    register: answerEditRegister,
    handleSubmit: answerEditHandleSubmit,
    setValue,
  } = useForm<AnswerForm>({ shouldUnregister: true });
  const [editState, setEditState] = useState([false]); // 댓글 수정창 상태
  const { data, mutate } = useSWR<CommunityPostResponse>(
    router.query.id ? `/api/posts/${router.query.id}` : null
  );
  const [wonder, { loading }] = useMutation(
    `/api/posts/${router.query.id}/wonder`,
    "POST"
  );
  const [sendAnswer, { data: answerData, loading: answerLoading }] =
    useMutation<AnswerResponse>(
      `/api/posts/${router.query.id}/answers`,
      "POST"
    );
  const [editAnswer, { data: editAnswerData, loading: editAnswerLoading }] =
    useMutation<AnswerResponse>(`/api/posts/${router.query.id}/answers`, "PUT");
  const [
    deleteAnswer,
    { data: deleteAnswerData, loading: deleteAnswerLoading },
  ] = useMutation<AnswerResponse>(
    `/api/posts/${router.query.id}/answers`,
    "DELETE"
  );
  const [deletePost, { data: deleteData, loading: deleteLoading }] =
    useMutation<DeletePostResponse>(`/api/posts/${router.query.id}`, "DELETE");
  const formatDate = () => {
    if (!data?.post.createdAt) return;
    const { year, month, day, hour, minute } = getDateTime(
      String(data?.post.createdAt)
    );
    return (
      <span className="text-gray-500 font-medium text-xs ml-2">
        {`${year}.${month}.${day} ${hour}:${minute}`}
      </span>
    );
  };
  const onDeleteClick = () => {
    if (deleteLoading) return;
    swal({
      title: "정말 삭제하시겠습니까?",
      icon: "warning",
      buttons: true as unknown as undefined,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("성공적으로 삭제되었습니다.", {
          icon: "success",
        });
        deletePost("");
      }
    });
  };
  const onWonderClick = () => {
    if (!data) return;
    mutate(
      // useSWR의 mutate를 사용할 때는 첫번째 인자로 key를 주지 않아도 된다. 하지만 useSWRConfig의 mutate를 사용할 때는 key를 줘야 한다.
      {
        ...data,
        post: {
          ...data?.post,
          _count: {
            ...data?.post._count,
            wondering: data.isWondering
              ? data?.post._count.wondering - 1
              : data?.post._count.wondering + 1,
          },
        },
        isWondering: !data.isWondering,
      }, // 바꿀 데이터 값
      false // default는 true, false값을 주면 mutate 이후에 revalidate 하지 않는다.
    );
    if (!loading) {
      wonder({});
    }
  };
  const onValid = (form: AnswerForm) => {
    if (answerLoading) return;
    sendAnswer(form);
  };

  const onValidEditAnswer = (form: AnswerForm) => {
    // 댓글 수정할 경우
    if (editAnswerLoading) return;
    editAnswer(form);
    // editReset();
  };
  useEffect(() => {
    if (answerData && answerData.ok) {
      reset(); // input에 적혀있는 값들 초기화
      mutate(); // 인자가 없을 경우 해당 useSWR을 재검증하기만 한다.
    }
  }, [answerData, reset, mutate]);
  useEffect(() => {
    if (deleteData && deleteData?.ok) {
      router.back();
    }
  }, [deleteData]);
  useEffect(() => {
    // 댓글 수정 시 댓글 재검증
    if (editAnswerData?.ok) {
      setEditState([false]);
      mutate();
    }
    if (deleteAnswerData?.ok) {
      mutate();
    }
  }, [editAnswerData, deleteAnswerData]);

  return (
    <Layout canGoBack>
      <div>
        <div className="flex justify-between items-center">
          <div>
            <span className="inline-flex my-3 ml-4 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              동네질문
            </span>
            {data?.post.createdAt ? formatDate() : null}
          </div>

          {user?.id && data?.post.userId === user?.id ? (
            <div className="flex justify-between w-14 mr-3 text-xs text-gray-500">
              <button
                onClick={() => {
                  router.push(`/community/${router.query.id}/edit`);
                }}
              >
                수정
              </button>
              <button onClick={onDeleteClick}>삭제</button>
            </div>
          ) : null}
        </div>

        <div className="flex mb-3 px-4 pb-3  border-b items-center space-x-3">
          {data?.post.user.avatar ? (
            <img
              src={data.post.user.avatar}
              className="w-10 h-10 rounded-full bg-slate-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-300" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">
              {data?.post?.user?.name}
            </p>
            <Link href={`/users/profiles/${data?.post?.user?.id}`}>
              <a className="text-xs font-medium text-gray-500">
                View profile &rarr;
              </a>
            </Link>
          </div>
        </div>
        <div>
          <div className="flex mt-2 px-4 text-gray-700 space-x-2">
            <span className="text-orange-500 font-medium">Q.</span>
            <pre className="whitespace-pre-wrap font-sans">{data?.post?.question}</pre>
          </div>
          <div className="flex px-4 space-x-5 mt-3 text-gray-700 py-2.5 border-t border-b-[2px]  w-full">
            <button
              onClick={onWonderClick}
              className={cls(
                "flex space-x-2 items-center text-sm",
                data?.isWondering ? "text-teal-400" : ""
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>궁금해요 {data?.post?._count?.wondering}</span>
            </button>
            <span className="flex space-x-2 items-center text-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
              <span>답변 {data?.post?._count?.answers}</span>
            </span>
          </div>
        </div>
        <div className="px-4 my-5 space-y-5">
          {data?.post?.answers.map((answer, i) => {
            const { tyear, tmonth, tday } = getTodayDateTime.getDate();
            const { year, month, day, hour, minute } = getDateTime(
              String(answer.createdAt)
            );
            return (
              <div key={answer.id}>
                <div className="relative flex-col">
                  <div className="flex justify-between w-full">
                    <div className="flex w-auto space-x-2">
                      {answer.user.avatar ? (
                        <img
                          src={answer.user.avatar}
                          className="w-8 h-8 rounded-full bg-slate-500"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                      )}
                      <div>
                        <span className="text-sm block font-medium text-gray-700">
                          {answer.user.name}
                        </span>
                        <span className="text-xs text-gray-500 block whitespace-nowrap">
                          {tyear === year && tmonth === month && tday === day
                            ? `${hour}:${minute}`
                            : `${year}.${month}.${day} ${hour}:${minute}`}
                        </span>
                      </div>
                    </div>
                    {user?.id && answer.user.id === user?.id ? (
                      <div className="flex justify-end items-start space-x-2 text-xs text-gray-500">
                        <button
                          onClick={() => {
                            let nEditState = new Array(editState.length).fill(
                              false
                            );
                            nEditState[i] = !editState[i];
                            setEditState(nEditState);
                            setValue("answer", answer.answer);
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            if (deleteAnswerLoading) return;
                            deleteAnswer({ id: answer.id });
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {editState[i] ? null : (
                    <p className="ml-10 text-gray-700 mt-2">{answer.answer}</p>
                  )}
                </div>
                <div>
                  {editState[i] ? (
                    <form onSubmit={answerEditHandleSubmit(onValidEditAnswer)}>
                      <TextArea
                        name="description"
                        required
                        register={answerEditRegister("answer", {
                          required: true,
                          minLength: 1,
                        })}
                      />
                      <input
                        {...answerEditRegister("id", { value: answer.id })}
                        type="hidden"
                      />
                      <button className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:outline-none ">
                        {answerLoading ? "Loading..." : "Reply"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <form className="px-4" onSubmit={handleSubmit(onValid)}>
          <TextArea
            name="description"
            placeholder="Answer this question!"
            required
            register={register("answer", { required: true, minLength: 1 })}
          />
          <button className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:outline-none ">
            {answerLoading ? "Loading..." : "Reply"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CommunityPostDetail;
