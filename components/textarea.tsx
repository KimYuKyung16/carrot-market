import { cls } from "@libs/client/utils";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps {
  label?: string;
  name?: string;
  register: UseFormRegisterReturn;
  [key: string]: any;
}

export default function TextArea({
  label,
  name,
  register,
  ...rest
}: TextAreaProps) {
  return (
    <div>
      {label ? (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={name}
        {...register}
        className={
          "w-full px-3 py-2 mt-1 shadow-sm  border focus:ring-orange-500 rounded-md border-gray-300 focus:border focus:border-orange-500 focus:outline-none"
        }
        rows={4}
        {...rest}
      />
    </div>
  );
}
