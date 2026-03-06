import { Injectable } from '@nestjs/common';
import { Board } from './board.interface';

@Injectable()
export class BoardsService {
  private boards: Board[] = [
    {
      id: 1,
      title: 'Учебная доска',
      description: 'Доска для заданий и конспектов по React',
      status: 'активная',
      createdAt: '2025-03-15',
    },
    {
      id: 2,
      title: 'Рабочие задачи',
      description: 'Ежедневные задачи и проекты',
      status: 'активная',
      createdAt: '2025-03-10',
    },
    {
      id: 3,
      title: 'Личные дела',
      description: 'Планы и напоминания',
      status: 'архивная',
      createdAt: '2025-03-05',
    },
  ];

  findAll(): Board[] {
    return this.boards;
  }

  findOne(id: number): Board | undefined {
    return this.boards.find((board) => board.id === id);
  }

  create(board: Omit<Board, 'id' | 'createdAt'>): Board {
    const newBoard: Board = {
      id: this.boards.length > 0 ? Math.max(...this.boards.map((b) => b.id)) + 1 : 1,
      ...board,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.boards.push(newBoard);
    return newBoard;
  }

  update(id: number, updateData: Partial<Omit<Board, 'id' | 'createdAt'>>): Board | undefined {
    const boardIndex = this.boards.findIndex((board) => board.id === id);
    if (boardIndex === -1) {
      return undefined;
    }
    this.boards[boardIndex] = { ...this.boards[boardIndex], ...updateData };
    return this.boards[boardIndex];
  }

  remove(id: number): boolean {
    const boardIndex = this.boards.findIndex((board) => board.id === id);
    if (boardIndex === -1) {
      return false;
    }
    this.boards.splice(boardIndex, 1);
    return true;
  }
}

