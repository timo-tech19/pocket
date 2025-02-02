import {
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { ConfigType } from '@nestjs/config'
import { hash, verify } from 'argon2'

import { CreateUserDto } from '../user/dto/create-user.dto'
import { UserService } from 'src/user/user.service'
import { AuthJwtPayload } from './types/auth-jwt-payload'
import refreshConfig from './config/refresh.config'
import { Role } from '@prisma/client'

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject(refreshConfig.KEY)
        private refreshTokenConfig: ConfigType<typeof refreshConfig>,
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
            role: user.role,
        }
    }

    async login(userId: number, name: string, role: Role) {
        const { accessToken, refreshToken } = await this.generateTokens(userId)

        const hashedRT = await hash(refreshToken)
        await this.userService.updateHashedRefreshToken(userId, hashedRT)

        return {
            id: userId,
            name,
            role,
            accessToken,
            refreshToken,
        }
    }

    async generateTokens(userId: number) {
        const payload: AuthJwtPayload = { sub: userId }

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ])

        return { accessToken, refreshToken }
    }

    async validateJwtUser(userId: number) {
        const user = await this.userService.findById(userId)
        if (!user) throw new UnauthorizedException('User not found!')

        return { id: user.id, role: user.role }
    }

    async validateRefreshToken(userId: number, refreshToken: string) {
        const user = await this.userService.findById(userId)
        if (!user) throw new UnauthorizedException('User not found!')

        const refreshTokenMatched = await verify(
            user.hashedRefreshToken,
            refreshToken,
        )

        if (!refreshTokenMatched)
            throw new UnauthorizedException('Invalid Refresh Token!')

        return { id: user.id }
    }

    async refreshToken(userId: number, name: string) {
        const { accessToken, refreshToken } = await this.generateTokens(userId)

        const hashedRT = await hash(refreshToken)
        await this.userService.updateHashedRefreshToken(userId, hashedRT)

        return {
            id: userId,
            name,
            accessToken,
            refreshToken,
        }
    }

    async validateGoogleUser(googleUser: CreateUserDto) {
        const user = await this.userService.findByEmail(googleUser.email)

        if (user) return user

        return this.userService.create(googleUser)
    }

    async signOut(userId: number) {
        return this.userService.updateHashedRefreshToken(userId, null)
    }
}
