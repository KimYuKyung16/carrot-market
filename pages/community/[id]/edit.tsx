import type { NextPage } from "next";
import Button from "@components/button";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect } from "react";
import { Post } from "@prisma/client";
import { useRouter } from "next/router";
import useCoords from "@libs/client/useCoords";
import { CommunityPostResponse } from ".";
import useSWR from "swr";

interface WriteForm {
  question: string;
}

interface WriteResponse {
  ok: boolean;
  post: Post;
}

const Edit: NextPage = () => {
  const { latitude, longitude } = useCoords(); // 위도, 경도
  const router = useRouter();
  const { data: communityPostData, mutate } = useSWR<CommunityPostResponse>(
    router.query.id ? `/api/posts/${router.query.id}` : null
  );
  const { register, handleSubmit, setValue } = useForm<WriteForm>();
  useEffect(() => {
    if (communityPostData?.post.question)
      setValue("question", communityPostData?.post.question);
  }, [communityPostData, setValue]);
  const [editPost, { loading, data }] = useMutation<WriteResponse>(
    `/api/posts/${router.query.id}`,
    "PUT"
  );
  const onValid = (data: WriteForm) => {
    if (loading) return; // 제출 중에 버튼을 또 누르는 것을 방지
    editPost({ ...data });
  };
  useEffect(() => {
    if (data && data.ok) {
      router.back();
    }
  }, [data]);
  return (
    <Layout canGoBack title="Edit Post">
      <form onSubmit={handleSubmit(onValid)} className="p-4 space-y-4">
        <TextArea
          register={register("question", { required: true, minLength: 5 })}
          required
          placeholder="Ask a question!"
        />
        <Button text={loading ? "Loading..." : "Submit"} />
      </form>
    </Layout>
  );
};

export default Edit;
