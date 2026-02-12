import { Board } from './board.interface';
export declare class BoardsService {
    private boards;
    findAll(): Board[];
    findOne(id: number): Board | undefined;
    create(board: Omit<Board, 'id' | 'createdAt'>): Board;
    update(id: number, updateData: Partial<Omit<Board, 'id' | 'createdAt'>>): Board | undefined;
    remove(id: number): boolean;
}
