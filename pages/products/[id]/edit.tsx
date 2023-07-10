import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ItemDetailResponse } from ".";
import useSWR from "swr";
import { S3 } from "aws-sdk";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";

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
}

const Edit: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { register, setValue, handleSubmit, watch } =
    useForm<UploadProductForm>();
  const productImage = watch("image");
  const { data: uploadUrl } = useSWR<UploadProduct>(
    productImage && productImage[0] && user
      ? `/api/upload-url?file=${productImage[0].name}&fileType=${productImage[0].type}&userId=${user?.id}&type=product`
      : null
  );
  const { data: productData } = useSWR<ItemDetailResponse>(
    router.query.id ? `/api/products/${router.query.id}` : null
  );
  useEffect(() => {
    if (productData?.product.name) setValue("name", productData.product.name);
    if (productData?.product.price)
      setValue("price", productData.product.price);
    if (productData?.product.description)
      setValue("description", productData.product.description);
  }, [productData, setValue]);

  const [updateProduct, { loading, data }] = useMutation<UploadProductMutation>(
    `/api/products/${router.query.id}`,
    "PUT"
  );

  const onValid = async ({ name, price, description }: UploadProductForm) => {
    if (!productData || loading) return;
    let uploadImage;
    if (uploadUrl) {
      const {
        nFilename,
        image: { url, fields },
      } = uploadUrl;
      const file = productImage[0];
      const fd = new FormData();
      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        fd.append(key, value as string);
      });
      uploadImage = await fetch(url, { method: "POST", body: fd });
      updateProduct({
        file: uploadImage && uploadImage.ok ? nFilename : null,
        name,
        price,
        description,
      });
    } else {
      updateProduct({ file: null, name, price, description });
    }
  };
  useEffect(() => {
    if (data?.ok) {
      router.back();
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
    <Layout canGoBack title="Edit Product">
      <form className="p-4 space-y-4" onSubmit={handleSubmit(onValid)}>
        <div>
          {productPreview ? (
            <label className="w-full text-gray-600 rounded-md">
              <div className="w-full h-0 aspect-w-16 aspect-h-9">
                <img src={productPreview} alt="제품 이미지"/>
              </div>
              <input {...register("image")} className="hidden" type="file" />
            </label>
          ) : productData?.product.image ? (
            <label className="w-full text-gray-600 rounded-md">
              <div className="w-full h-0 aspect-w-16 aspect-h-9">
                <img src={productData.product.image} alt="제품 이미지"/>
              </div>
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

export default Edit;
