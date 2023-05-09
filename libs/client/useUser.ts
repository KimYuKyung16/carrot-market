import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

// 데이터를 불러와서 리턴

// mutate: 캐시 안에 저장된 data를 수정하는 함수
// useSWR은 유저가 다른 탭으로 갔다가 다시 돌아왔을 떄 데이터를 새로고침 하는 작업을 해준다.

interface ProfileResponse {
  ok: boolean;
  profile: User;
}

export default function useUser() {
  const { data, error, mutate } = useSWR<ProfileResponse>("/api/users/me");
  const router = useRouter();
  useEffect(() => {
    if (data && !data.ok) {
      router.replace("/enter");
    }
  }, [data, router]);
  // return router.replace("/enter");

  return { user: data?.profile, isLoading: !data && !error };
}
