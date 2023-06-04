import type { NextPage } from "next";
import Layout from "@components/layout";
import Message from "@components/message";
import { io } from "socket.io-client";

const ChatDetail: NextPage = () => {

  const socket = io("http://localhost:5000");

  // socket.connected : 소켓이 현재 서버에 연결 되어있는지 여부를 설명(true, false)
  socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  socket.on("hello", (arg) => {
    console.log(arg)
  })
  
  socket.on("disconnect", (reason) => {
    console.log("연결해제")
    console.log(reason);
  });

  return (
    <Layout canGoBack title="Steve">
      <div className="py-10 pb-16 px-4 space-y-4">
        <Message message="Hi how much are you selling them for?" />
        <Message message="I want ￦20,000" reversed />
        <Message message="미쳤어" />
        <form className="fixed py-2 bg-white  bottom-0 inset-x-0">
          <div className="flex relative max-w-md items-center  w-full mx-auto">
            <input
              type="text"
              className="shadow-sm rounded-full w-full border-gray-300 focus:ring-orange-500 focus:outline-none pr-12 focus:border-orange-500"
            />
            <div className="absolute inset-y-0 flex py-1.5 pr-1.5 right-0">
              <button className="flex focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center bg-orange-500 rounded-full px-3 hover:bg-orange-600 text-sm text-white">
                &rarr;
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChatDetail;
