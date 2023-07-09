import { cls } from "@libs/client/utils";
import { useRef, useState } from "react";
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
  const textRef = useRef<any>(null);
  const handleResizeHeight = () => {
    textRef.current.style.height = "122px";
    textRef.current.style.height = textRef.current.scrollHeight + "px";
  };

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
        className={`h-[120px] w-full px-3 py-2 mt-1 shadow-sm resize-none border focus:ring-orange-500 rounded-md border-gray-300 focus:border focus:border-orange-500 focus:outline-none overflow-y-hidden`}
        ref={(e) => {
          register.ref(e);
          textRef.current = e;
        }}
        {...rest}
        onChange={handleResizeHeight}
      />
    </div>
  );
}
