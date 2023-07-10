import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import useUser from "@libs/client/useUser";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import useMutation from "@libs/client/useMutation";
import { S3 } from "aws-sdk";
import useSWR from "swr";

interface EditProfiltForm {
  email?: string;
  phone?: string;
  name?: string;
  avatar?: FileList;
  formErrors?: string;
}

interface EditProfile {
  ok: boolean;
  image: S3.PresignedPost;
  nFilename: string;
}

interface EditProfileResponse {
  ok: boolean;
  error?: string;
}

const EditProfile: NextPage = () => {
  const { user } = useUser();
  const {
    register,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
    watch, // watch: 모든 폼의 변경을 감지할 수 있음.
  } = useForm<EditProfiltForm>();
  const avatar = watch("avatar");
  const { data: uploadUrl } = useSWR<EditProfile>(
    avatar && avatar[0] && user
      ? `/api/upload-url?file=${avatar[0].name}&fileType=${avatar[0].type}&userId=${user?.id}&type=profile`
      : null
  );
  const [editProfile, { data, loading }] = useMutation<EditProfileResponse>(
    `/api/users/me`,
    "PUT"
  );

  const onValid = async ({ email, phone, name, avatar }: EditProfiltForm) => {
    if (loading) return;
    if (email === "" && phone === "" && name === "") {
      return setError("formErrors", {
        message: "이메일 혹은 전화번호가 필요합니다. 하나를 선택하세요",
      });
    }
    if (avatar && avatar.length >= 1) {
      if (!uploadUrl) return;
      const {
        nFilename,
        image: { url, fields },
      } = uploadUrl;
      const file = avatar[0];
      const fd = new FormData();
      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        fd.append(key, value as string);
      });
      const uploadImage = await fetch(url, { method: "POST", body: fd });
      editProfile({
        file: uploadImage && uploadImage.ok ? nFilename : null,
        email,
        phone,
        name,
      });
    } else {
      editProfile({ email, phone, name });
    }
  };
  useEffect(() => {
    if (data && !data.ok && data.error) {
      setError("formErrors", { message: data.error });
    }
  }, [data, setError]);

  const [avatarPreview, setAvatarPreview] = useState("");
  useEffect(() => {
    if (avatar && avatar.length > 0) {
      const file = avatar[0];
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, [avatar]);
  useEffect(() => {
    if (user?.name) setValue("name", user.name);
    if (user?.email) setValue("email", user.email);
    if (user?.phone) setValue("phone", user.phone);
  }, [user, setValue]);

  return (
    <Layout canGoBack title="Edit Profile">
      <form onSubmit={handleSubmit(onValid)} className="py-10 px-4 space-y-4">
        <div className="flex items-center space-x-3">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-14 h-14 rounded-full bg-slate-500"
              alt="프로필 사진"
            />
          ) : user?.avatar ? (
            <img src={user?.avatar} className="w-14 h-14 rounded-full" alt="프로필 사진"/>
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-500" />
          )}
          <label
            htmlFor="picture"
            className="cursor-pointer py-2 px-3 border hover:bg-gray-50 border-gray-300 rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-gray-700"
          >
            Change
            <input
              {...register("avatar")}
              id="picture"
              type="file"
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
        <Input
          register={register("name")}
          required={false}
          label="Name"
          name="name"
          type="text"
        />
        <Input
          register={register("email")}
          required={false}
          label="Email address"
          name="email"
          type="email"
        />
        <Input
          register={register("phone")}
          required={false}
          label="Phone number"
          name="phone"
          type="number"
          kind="phone"
        />
        {errors.formErrors ? (
          <span className="my-2 text-red-500 font-medium text-center block">
            {errors.formErrors.message}
          </span>
        ) : null}
        <Button text={loading ? "Loading..." : "Update profile"} />
      </form>
    </Layout>
  );
};

export default EditProfile;
