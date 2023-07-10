import type { NextPage } from "next";
import Item from "@components/item";
import Layout from "@components/layout";
import ProductList from "@components/product-list";
import useSWR from "swr";
import { Product } from "@prisma/client";
import { ProductWithCount } from "pages";
import useUser from "@libs/client/useUser";

interface ProductListResponse {
  ok: boolean;
  sales: ProductWithCount[];
}

const Sold: NextPage = () => {
  const { user } = useUser();
  const { data } = useSWR<ProductListResponse>(`/api/users/me/sales`);

  return (
    <Layout title="판매내역" canGoBack>
      <div className="flex flex-col space-y-5 pb-10  divide-y">
        {user && data?.sales.map((product) => (
          <Item
            id={product.id}
            key={product.id}
            image={product.image}
            title={product.name}
            state={product.state}
            price={product.price}
            hearts={product._count.favs}
            comments={product._count.Chat}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Sold;
