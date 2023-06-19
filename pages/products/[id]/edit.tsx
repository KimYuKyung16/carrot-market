import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { useRouter } from "next/router";
import useImageMutation from "@libs/client/useImageMutaion";
import { ItemDetailResponse } from ".";
import useSWR from "swr";
import { S3 } from "aws-sdk";

interface UploadProductForm {
  image: FileList;
  name: string;
  price: number;
  description: string;
}

interface UploadProduct {
  ok: boolean;
  product: S3.PresignedPost;
}

const Edit: NextPage = () => {
  const router = useRouter();
  const { register, setValue, handleSubmit, watch } =
    useForm<UploadProductForm>();
  const productImage = watch("image");
  const { data: uploadUrl } = useSWR<UploadProduct>(
    router.query.id && productImage && productImage[0]
      ? `/api/upload-url?file=${productImage[0].name}&fileType=${productImage[0].type}`
      : null
  );
  const { data: productData } = useSWR<ItemDetailResponse>(
    router.query.id
      ? `/api/products/${router.query.id}`
      : null
  );
  useEffect(() => {
    if (productData?.product.name) setValue("name", productData.product.name);
    if (productData?.product.price)
      setValue("price", productData.product.price);
    if (productData?.product.description)
      setValue("description", productData.product.description);
  }, [productData, setValue]);

  // const [updateProduct, { loading, data }] =
  //   useImageMutation<UploadProductMutation>(
  //     `/api/products/${router.query.id}`,
  //     "PUT"
  //   );



  const onValid = async ({ name, price, description }: UploadProductForm) => {
    if (!productData || !uploadUrl || !productImage) return;

    const file = productImage[0];
    const { url, fields } = uploadUrl.product;
    const fd = new FormData();
    
    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      fd.append(key, value as string)
    })

    
    // console.log(url, fields);

    // fd.append("name", name);
    // fd.append("price", String(price));
    // fd.append("description", description);
    // if (productImage && productImage.length > 0) {
    //   fd.append("productImage", productImage[0]);
    // }

    const upload  = await fetch(url, {
      method: 'POST',
      body: fd,
    })

    console.log(upload)

    // updateProduct(fd);
  };
  // useEffect(() => {
  //   if (data?.ok) {
  //     router.back();
  //   }
  // }, [data, router]);

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
            <label className="w-full text-gray-600 aspect-video rounded-md">
              <img src={productPreview} />
              <input {...register("image")} className="hidden" type="file" />
            </label>
          ) : productData?.product.image ? (
            <label className="w-full text-gray-600 aspect-video rounded-md">
              <img src={productData.product.image} />
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
        <Button text={true ? "Loading..." : "Upload item"} />
      </form>
    </Layout>
  );
};

export default Edit;
