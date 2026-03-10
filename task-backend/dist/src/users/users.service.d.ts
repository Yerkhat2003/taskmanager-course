import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        createdAt: Date;
        email: string;
        name: string;
        passwordHash: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findById(id: number): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        createdAt: Date;
        email: string;
        name: string;
        passwordHash: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    createUser(data: {
        email: string;
        name: string;
        passwordHash: string;
    }): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        createdAt: Date;
        email: string;
        name: string;
        passwordHash: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
