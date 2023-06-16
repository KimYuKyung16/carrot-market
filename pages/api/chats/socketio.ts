import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { Server as NetServer, Socket } from "net";
import { disconnect } from "process";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("흠")
    const httpServer: HttpServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer);
    res.socket.server.io = io;

    io.on('connection', (socket: any) => {
      socket.on('setRoomNum', (num: number) => {
        if (num) {
          socket.join(String(num));
          console.log(num, '방에 입장했습니다')
        }
      })
    
      socket.on('message', (msg: any) => {
        io.to(msg.roomNum).emit('send Message', msg.message);
        if (msg.message.message === "거래가 완료되었습니다" && msg.message.notification) {
          io.to(msg.roomNum).emit('review', msg.message.userId);
        }
      });
    
      socket.on('deleteMessage', (msg: any) => {
        io.to(msg.roomNum).emit('delete Message', msg.message);
      });
    
      socket.on('leaveRoom', (roomNum: string) => {
        socket.leave(roomNum);
        socket.disconnect();
      })
    });
  }

  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};
