import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { hash } from 'argon2'

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        const { password, ...user } = createUserDto
        const hashedPassword = await hash(password)

        return this.prisma.user.create({
            data: {
                ...user,
                password: hashedPassword,
            },
        })
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email,
            },
        })
    }

    async findById(userId: number) {
        return this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        })
    }

    async updateHashedRefreshToken(userId: number, hashedRT: string | null) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: hashedRT },
        })
    }
}
