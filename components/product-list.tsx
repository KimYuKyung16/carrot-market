import { ProductWithCount } from "pages";
import useSWR from "swr";
import Item from "./item";

interface ProductListProps {
  kind: "favs" | "purchases";
}

interface Record {
  id: number;
  product: ProductWithCount;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
}

interface ProductListResponse {
  [key: string]: Record[]; // 여러 key값들이 들어올 수 있다는 의미
}

export default function ProductList({ kind }: ProductListProps) {
  const { data } = useSWR<ProductListResponse>(`/api/users/me/${kind}`);

  return data ? (
    <>
      {data[kind]?.map((record) => (
        <Item
          id={record.productId}
          key={record.id}
          image={record.product ? record.product.image : record.productImage}
          title={record.product ? record.product.name : record.productName}
          state={record.product ? record.product.state : true}
          price={record.product ? record.product.price : record.productPrice}
          hearts={record.product ? record.product._count.favs : undefined}
          comments={record.product ? record.product._count.Chat : undefined}
        />
      ))}
    </>
  ) : null;
}
