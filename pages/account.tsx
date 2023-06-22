import { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import Input from "@components/input";
import Button from "@components/button";
import useMutation from "@libs/client/useMutation";
import { useRouter } from "next/router";
import swal from "sweetalert";

interface LoginForm {
  username: string;
  phone: string;
  email: string;
}

interface MutationResult {
  ok: boolean;
  error?: string; 
}

export default function Forms() {
  const router = useRouter();
  const [account, { loading, data }] = useMutation<MutationResult>(
    "/api/users/account",
    "POST"
  );
  let [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const onValid = (data: LoginForm) => {
    if (!data.email && !data.phone) {
      setError('이메일이나 전화번호를 입력해주세요')
      return;
    }
    setError('');
    account(data)
  };
  const onInvalid = (errors: FieldErrors) => {
    setError(errors[Object.keys(errors)[0]]?.message as string);
  };

  useEffect(() => {
    if (data && !data?.ok) {
      swal(data.error as string);
    }
    if (data && data?.ok) {
      router.replace('/');
    }
  }, [data])

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} className="mt-16 px-4">
      <h3 className="text-3xl font-bold text-center mb-5">회원가입</h3>

      <div className="flex flex-col space-y-4 mb-3">
        <Input
          register ={register("username", {
            required: "이름을 입력해주세요",
            minLength: {
              message: "이름은 5글자 이상으로 적어주세요",
              value: 5,
            },
          })}
          type="text"
          label="username"
          placeholder="Username"
          name="username"
          required
        />

        <Input
          register ={register("email")}
          type="email"
          label="email"
          placeholder="Email"
          name="email"
          required = {false}
        />

        <Input
          register ={register("phone")}
          type="text"
          label="phone number"
          placeholder="Phone number"
          name="phone number"
          kind="phone"
          required = {false}
        />
      </div>
      <p className="text-red-600 font-semibold mb-3 text-sm"> {error}</p>
      <p className="text-orange-600 mb-5">※ 이메일이나 전화번호 중 하나만 적어도 가능합니다</p>
      <Button text="Create Account"/>
    </form>
  );
}
