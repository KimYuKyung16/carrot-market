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
import imageCompression from "browser-image-compression";

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
  const [imageInfo, setImageInfo] = useState({ name: "", type: "" });
  const { data: uploadUrl } = useSWR<UploadProduct>(
    imageInfo.name && imageInfo.type && user
      ? `/api/upload-url?file=${imageInfo.name}&fileType=${imageInfo.type}&userId=${user?.id}&type=product`
      : null
  );
  const [compressedFile, setCompressedFile] = useState<File>();
  const [uploadProduct, { loading, data }] = useMutation<UploadProductMutation>(
    "/api/products",
    "POST"
  );
  const onValid = async ({ name, price, description }: UploadProductForm) => {
    if (loading || !uploadUrl || !compressedFile) return;
    const {
      nFilename,
      image: { url, fields },
    } = uploadUrl;
    const fd = new FormData();
    Object.entries({ ...fields, file: compressedFile }).forEach(([key, value]) => {
      fd.append(key, value as string);
    });
    const uploadImage = await fetch(url, { method: "POST", body: fd });
    if (!uploadImage.ok) return;
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
    const compressImage = async () => {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      };
      const compressedFile = await imageCompression(productImage[0], options);
      const file = new File([compressedFile], compressedFile.name, {
        type: "image/jpeg",
      });
      setProductPreview(URL.createObjectURL(file));
      setImageInfo({ name: productImage[0].name, type: productImage[0].type });
      setCompressedFile(file);
    }

    if (productImage && productImage.length > 0) {
      compressImage();
    }
  }, [productImage]);

  return (
    <Layout canGoBack title="Upload Product">
      <form className="p-4 space-y-4" onSubmit={handleSubmit(onValid)}>
        <div>
          {productPreview ? (
            <label className="w-full text-gray-600 rounded-md">
              <div className="w-full h-0 aspect-w-16 aspect-h-9">
                <img src={productPreview} alt="제품 이미지"/>
              </div>
              <input {...register("image")} className="hidden" type="file" />
            </label>
          ) : (
            <label className="h-0 w-full aspect-w-16 aspect-h-9 cursor-pointer flex items-center justify-center rounded-md">
              <div className="w-full h-full cursor-pointer text-gray-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
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
              </div>
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
