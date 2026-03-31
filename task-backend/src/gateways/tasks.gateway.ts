import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join:board')
  handleJoin(
    @MessageBody() boardId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`board:${boardId}`);
    return { event: 'joined', data: boardId };
  }

  @SubscribeMessage('leave:board')
  handleLeave(
    @MessageBody() boardId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`board:${boardId}`);
  }

  emitTaskCreated(boardId: number, task: any) {
    this.server.to(`board:${boardId}`).emit('task:created', task);
  }

  emitTaskUpdated(boardId: number, task: any) {
    this.server.to(`board:${boardId}`).emit('task:updated', task);
  }

  emitTaskDeleted(boardId: number, taskId: number) {
    this.server.to(`board:${boardId}`).emit('task:deleted', { id: taskId });
  }
}
