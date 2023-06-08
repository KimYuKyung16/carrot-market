import { ProductWithCount } from "pages";
import useSWR from "swr";
import Item from "./item";

interface ProductListProps {
  kind: "favs" | "sales" | "purchases";
}

interface Record {
  id: number;
  product: ProductWithCount;
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
          id={record.product.id}
          key={record.id}
          image={record.product.image}
          title={record.product.name}
          state={record.product.state}
          price={record.product.price}
          hearts={record.product._count.favs}
          comments={0}
        />
      ))}
    </>
  ) : null;
}
