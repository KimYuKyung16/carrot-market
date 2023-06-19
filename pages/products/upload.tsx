import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { useRouter } from "next/router";
import { S3 } from "aws-sdk";
import useUser from "@libs/client/useUser";
import useSWR from "swr";

interface UploadProductForm {
  image: FileList;
  name: string;
  price: number;
  description: string;
}

interface UploadProduct {
  ok: boolean;
  image: S3.PresignedPost;
  nFilename: string;
}

interface UploadProductMutation {
  ok: boolean;
  product: Product;
}

// handleSubmit(성공했을 경우 함수, 실패했을 경우 함수)
const Upload: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { register, handleSubmit, watch } = useForm<UploadProductForm>();
  const productImage = watch("image");
  const { data: uploadUrl } = useSWR<UploadProduct>(
    productImage && productImage[0] && user
      ? `/api/upload-url?file=${productImage[0].name}&fileType=${productImage[0].type}&userId=${user?.id}&type=product`
      : null
  );
  const [uploadProduct, { loading, data }] = useMutation<UploadProductMutation>(
    "/api/products",
    "POST"
  );

  const onValid = async ({ name, price, description }: UploadProductForm) => {
    if (loading || !uploadUrl) return;
    const {
      nFilename,
      image: { url, fields },
    } = uploadUrl;
    const file = productImage[0];
    const fd = new FormData();
    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      fd.append(key, value as string);
    });
    const uploadImage = await fetch(url, { method: "POST", body: fd });
    uploadProduct({
      file: uploadImage && uploadImage.ok ? nFilename : null,
      name,
      price,
      description,
    });
  };
  useEffect(() => {
    if (data?.ok) {
      router.replace(`/products/${data.product.id}`);
    }
  }, [data, router]);

  const [productPreview, setProductPreview] = useState("");
  useEffect(() => {
    if (productImage && productImage.length > 0) {
      const file = productImage[0];
      setProductPreview(URL.createObjectURL(file));
    }
  }, [productImage]);
  return (
    <Layout canGoBack title="Upload Product">
      <form className="p-4 space-y-4" onSubmit={handleSubmit(onValid)}>
        <div>
          {productPreview ? (
            <label className="w-full text-gray-600 aspect-video rounded-md">
              <img src={productPreview} />
              <input {...register("image")} className="hidden" type="file" />
            </label>
          ) : (
            <label className="w-full cursor-pointer text-gray-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center border-2 border-dashed border-gray-300 h-48 rounded-md">
              <svg
                className="h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input {...register("image")} className="hidden" type="file" />
            </label>
          )}
        </div>
        <Input
          register={register("name", { required: true })}
          required
          label="Name"
          name="name"
          type="text"
        />
        <Input
          register={register("price", { required: true })}
          required
          label="Price"
          name="price"
          type="text"
          kind="price"
        />
        <TextArea
          register={register("description", { required: true })}
          name="description"
          label="Description"
          required
        />
        <Button text={loading ? "Loading..." : "Upload item"} />
      </form>
    </Layout>
  );
};

export default Upload;
