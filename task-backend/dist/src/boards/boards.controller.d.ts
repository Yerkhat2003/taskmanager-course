import { BoardsService } from './boards.service';
import type { Board } from './board.interface';
export declare class BoardsController {
    private readonly boardsService;
    constructor(boardsService: BoardsService);
    getBoards(): Board[];
    getBoard(id: string): Board | undefined;
    createBoard(createBoardDto: Omit<Board, 'id' | 'createdAt'>): Board;
    updateBoard(id: string, updateBoardDto: Partial<Omit<Board, 'id' | 'createdAt'>>): Board | undefined;
    deleteBoard(id: string): void;
}
