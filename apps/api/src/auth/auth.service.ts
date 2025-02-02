import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { UserService } from 'src/user/user.service'
import { verify } from 'argon2'
import { AuthJwtPayload } from './types/auth-jwt-payload'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async signup(createUserDto: CreateUserDto) {
        const user = await this.userService.findByEmail(createUserDto.email)
        if (user) {
            throw new ConflictException('User already exists')
        }

        return this.userService.create(createUserDto)
    }

    async validateLocalUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email)
        if (!user) throw new UnauthorizedException('User not found!')

        const isPasswordMatched = await verify(user.password, password)
        if (!isPasswordMatched)
            throw new UnauthorizedException('Invalid Credentials!')

        return {
            id: user.id,
            name: user.name,
        }
    }

    async login(userId: number, name?: string) {
        const { accessToken } = await this.generateTokens(userId)

        return {
            id: userId,
            name,
            accessToken,
        }
    }

    async generateTokens(userId: number) {
        const payload: AuthJwtPayload = { sub: userId }

        const [accessToken] = await Promise.all([
            this.jwtService.signAsync(payload),
        ])

        return { accessToken }
    }

    async validateJwtUsr(userId: number) {
        const user = await this.userService.findById(userId)
        if (!user) throw new UnauthorizedException('User not found!')

        return { id: user.id }
    }
}
