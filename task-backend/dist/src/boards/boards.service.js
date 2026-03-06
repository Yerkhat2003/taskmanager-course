"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardsService = void 0;
const common_1 = require("@nestjs/common");
let BoardsService = class BoardsService {
    boards = [
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
    findAll() {
        return this.boards;
    }
    findOne(id) {
        return this.boards.find((board) => board.id === id);
    }
    create(board) {
        const newBoard = {
            id: this.boards.length > 0 ? Math.max(...this.boards.map((b) => b.id)) + 1 : 1,
            ...board,
            createdAt: new Date().toISOString().split('T')[0],
        };
        this.boards.push(newBoard);
        return newBoard;
    }
    update(id, updateData) {
        const boardIndex = this.boards.findIndex((board) => board.id === id);
        if (boardIndex === -1) {
            return undefined;
        }
        this.boards[boardIndex] = { ...this.boards[boardIndex], ...updateData };
        return this.boards[boardIndex];
    }
    remove(id) {
        const boardIndex = this.boards.findIndex((board) => board.id === id);
        if (boardIndex === -1) {
            return false;
        }
        this.boards.splice(boardIndex, 1);
        return true;
    }
};
exports.BoardsService = BoardsService;
exports.BoardsService = BoardsService = __decorate([
    (0, common_1.Injectable)()
], BoardsService);
//# sourceMappingURL=boards.service.js.map