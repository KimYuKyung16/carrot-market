import { cls } from "@libs/client/utils";

interface MessageProps {
  message: string;
  reversed?: boolean;
  avatarUrl?: string | null;
  date: string | null;
  name: string;
}

export default function Message({
  message,
  avatarUrl,
  date,
  name,
  reversed,
}: MessageProps) {
  return (
    <div
      className={cls(
        "flex items-start",
        reversed ? "flex-row-reverse space-x-reverse" : "space-x-2"
      )}
    >
      <div className="flex-col space-y-1">
        <div
          className={cls(
            "flex gap-3 text-xs",
            reversed ? "flex-row-reverse" : ""
          )}
        >
          <p className="whitespace-pre">{name}</p>
          <p className="text-gray-500 whitespace-pre">{date ? date : ''}</p>
        </div>
        <div className={cls("flex gap-2", reversed ? "flex-row-reverse" : "")}>
          {avatarUrl ? (
            <img src={avatarUrl} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-400" />
          )}

          <div className="w-100 text-sm text-gray-700 p-2 border border-gray-300 rounded-md">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
