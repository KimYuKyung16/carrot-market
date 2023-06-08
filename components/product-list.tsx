import { ProductWithCount } from "pages";
import useSWR from "swr";
import Item from "./item";

interface ProductListProps {
  kind: "favs" | "purchases";
}

interface Record {
  id: number;
  product: ProductWithCount;
  productName: string;
  productImage: string;
  productPrice: number;
}

interface ProductListResponse {
  [key: string]: Record[]; // 여러 key값들이 들어올 수 있다는 의미
}

export default function ProductList({ kind }: ProductListProps) {
  const { data } = useSWR<ProductListResponse>(`/api/users/me/${kind}`);

  console.log(data);
  return data ? (
    <>
      {data[kind]?.map((record) => (
        <Item
          id={record.product.id ? record.product.id : undefined}
          key={record.id}
          image={record.product.image ? record.product.image : record.productImage}
          title={record.product.name ? record.product.name : record.productName}
          state={record.product.state ? record.product.state : true}
          price={record.product.price ? record.product.price : record.productPrice}
          hearts={
            record.product._count ? record.product._count.favs : undefined
          }
          comments={
            record.product._count ? record.product._count.Chat : undefined
          }
        />
      ))}
    </>
  ) : null;
}
