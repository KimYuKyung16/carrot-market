import { FieldErrors, useForm } from "react-hook-form";

interface LoginForm {
  username: string;
  password: string;
  email: string;
}

export default function forms() {
  // register: input을 state와 연결시켜 주는 역할
  // watch: form을 보게 해주는 함수
  // handleSubmit: e.PreventDefault 같은 것을 하는 함수

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const onValid = (data: LoginForm) => {
    console.log("im valid bby");
  };
  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  }

  return(
    <form onSubmit={ handleSubmit(onValid, onInvalid) }>
      <input 
      {...register("username", { 
        required: "Username is required",
        minLength: {
          message: "The username should be longer than 5 chars.",
          value: 5,
        },
      })} 
      type="text" 
      placeholder="Username" />

      <input 
      {...register("email", { 
        required: "Email is required",
        validate: {
          notGmail: (value) => !value.includes("@gmail.com") || "Gmail is not allowed"
        }
      })} 
      type="email" 
      placeholder="Email" />

      <input {...register("password", { 
        required: "Password is required" 
      })} 
      type="password" 
      placeholder="Password" />

      <input type="submit" value="Create Account"/>
    </form>
  )
}