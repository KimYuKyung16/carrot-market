import type { NextPage } from "next";
import FloatingButton from "@components/floating-button";
import Item from "@components/item";
import Layout from "@components/layout";
import Head from "next/head";
import { Product } from "@prisma/client";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { cls } from "@libs/client/utils";
import { useRouter } from "next/router";

export interface ProductWithCount extends Product {
  _count: { favs: number; Chat: number };
}

interface ProductResponse {
  products: ProductWithCount[];
  cursor: string;
}

const Home: NextPage = () => {
  const router = useRouter();
  const loadRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [search, setSearch] = useState('');
  const { data, size, setSize } = useSWRInfinite<ProductResponse>(
    (pageIndex: number, previousPageData: ProductResponse) => {
      if (previousPageData && previousPageData.products.length < 20) {
        setVisible(false);
        return null;
      }
      return search
        ? (previousPageData ? `/api/products?cursor=${previousPageData.cursor}&search=${search}` : `/api/products?search=${search}`)
        : (previousPageData ? `/api/products?cursor=${previousPageData.cursor}` : `/api/products`)
    }
  );

  const callback = (entries: any) => {
    const [entry] = entries;
    if (entry.isIntersecting && data) {
      setSize(size + 1);
    }
  };
  const options = useMemo(() => {
    return {
      root: null,
      rootMargin: "0px",
      threshold: 0.3, // 대상의 30%가 표시될 때 콜백 호출
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    const target = loadRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadRef, options, data]);
  const searchFunc = (search: string) => {
    localStorage.setItem('productSearch', search);
    if (search.trim().length <= 0) return; 
    setSearch(search);
    setSize(1);
    setVisible(true);
  }
  useEffect(() => {
    const productSearch = localStorage.getItem('productSearch');
    if (productSearch) {
      setSearch(productSearch);
      setVisible(true);
    }
  }, [data])

  const reload = () => {
    localStorage.removeItem('productSearch')
  };
  useEffect(() => {
    (() => {
      window.addEventListener("beforeunload", reload);
    })();
    return () => {
      window.removeEventListener("beforeunload", reload);
    };
  }, []);

  return (
    <Layout title="홈" hasTabBar search searchFunc={searchFunc}>
      <Head>
        <title>Home</title>
      </Head>
      <div className="flex flex-col space-y-5 divide-y">
        {data
          ? data.map((products) =>
              products.products.map((product) => (
                <Item
                  id={product.id}
                  key={product.id}
                  image={product.image}
                  title={product.name}
                  state={product.state}
                  price={product.price}
                  comments={product._count.Chat}
                  hearts={product._count.favs}
                />
              ))
            )
          : null}
        <div
          ref={loadRef}
          className={cls(
            "flex justify-center bg-white",
            visible ? "block" : "hidden"
          )}
        >
          <img src="/loading_icon.svg" className="w-12 h-12" />
        </div>
        <FloatingButton href="/products/upload" aria-label="add">
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </FloatingButton>
      </div>
    </Layout>
  );
};

export default Home;
