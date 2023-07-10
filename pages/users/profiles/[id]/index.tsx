import type { NextPage } from "next";
import Link from "next/link";
import Layout from "@components/layout";
import useSWR from "swr";
import { User, Review } from "@prisma/client";
import { cls } from "@libs/client/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWRInfinite from "swr/infinite";

interface UserResponse {
  ok: boolean;
  user: User;
}
interface ReviewWithUser extends Review {
  createdBy: User;
}

interface ReviewsResponse {
  ok: boolean;
  reviews: ReviewWithUser[];
  cursor: string;
}

const Profile: NextPage = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const { data } = useSWR<UserResponse>(
    router.query.id ? `/api/users/${router.query.id}` : null
  );
  const {
    data: reviewData,
    size,
    setSize,
  } = useSWRInfinite<ReviewsResponse>(
    (pageIndex: number, previousPageData: ReviewsResponse) => {
      if (previousPageData && previousPageData.reviews.length < 10) {
        setVisible(false);
        return null;
      }
      return router.query.id
        ? previousPageData
          ? `/api/users/${router.query.id}/reviews?cursor=${previousPageData.cursor}`
          : `/api/users/${router.query.id}/reviews`
        : null;
    }
  );
  const [reviewState, setReviewState] = useState(
    new Array(reviewData?.length).fill(0).map(() => new Array(10).fill(false))
  );
  useEffect(() => {
    if (reviewData?.length === 1) {
      setVisible(true);
    }
    if (reviewData && reviewData[reviewData.length - 1].reviews.length < 10) {
      setVisible(false);
    }
  }, [reviewData]);

  return (
    <Layout hasTabBar canGoBack title={data?.user.name + "의 캐럿"}>
      <div className="px-4">
        <div className="flex items-start justify-between my-4 pr-10">
          <div className="flex items-center space-x-3">
            {data?.user.avatar ? (
              <img
                src={data.user.avatar}
                className="w-14 h-14 rounded-full bg-slate-500"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-500 rounded-full" />
            )}

            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {data?.user.name}
              </span>
            </div>
          </div>
          <Link href={`/users/profiles/${router.query.id}/sold`}>
            <a className="flex flex-col items-center">
              <div className="w-14 h-14 text-white bg-orange-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
              </div>
              <span className="text-sm mt-2 font-medium text-gray-700">
                판매내역
              </span>
            </a>
          </Link>
        </div>
        <div>
          <p className="bg-orange-400 text-l text-white px-2 py-2 rounded-md text-center">
            거래 후기
          </p>
        </div>
        {router.query.id && data && reviewData
          ? reviewData.map((reviews, index) =>
              reviews.reviews.map((review, i) => (
                <div key={review.id} className="mt-12">
                  <div className="flex space-x-4 items-center">
                    {review.createdBy.avatar ? (
                      <img
                        src={review.createdBy.avatar}
                        className="w-12 h-12 rounded-full bg-slate-500"
                      />
                    ) : (
                      <p className="w-12 h-12 rounded-full bg-slate-500" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        {review.createdBy.name}
                      </h4>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={cls(
                              "h-5 w-5",
                              review.score >= star
                                ? "text-yellow-400"
                                : "text-gray-400"
                            )}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 mb-2 text-gray-600 text-sm">
                    <pre
                      className={cls(
                        "whitespace-pre-wrap font-sans",
                        reviewState[index][i] ? "" : "line-clamp-3"
                      )}
                    >
                      {review.review}
                    </pre>
                    <p
                      onClick={() => {
                        let nReviewState = [...reviewState];
                        nReviewState[index][i] = !reviewState[index][i];
                        setReviewState(nReviewState);
                      }}
                      className="flex justify-end text-orange-300 text-xs font-bold pt-1"
                    >
                      {reviewState[index][i] ? "닫기" : "더보기"}
                    </p>
                  </div>
                </div>
              ))
            )
          : null}
        <button
          className={cls(
            "flex justify-center items-center bg-orange-400 text-white h-12 rounded-md w-full",
            visible ? "block" : "hidden"
          )}
          onClick={() => {
            setSize(size + 1);
            let nReviewState = [...reviewState];
            nReviewState.push(new Array(10).fill(false));
            setReviewState(nReviewState);
          }}
        >
          리뷰 더보기
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
