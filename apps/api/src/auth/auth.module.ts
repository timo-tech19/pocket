import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserService } from 'src/user/user.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshStrategy } from './strategies/refresh-token.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import jwtConfig from './config/jwt.config'
import refreshConfig from './config/refresh.config'
import googleOauthConfig from './config/google-oauth.config'

@Module({
    imports: [
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(refreshConfig),
        ConfigModule.forFeature(googleOauthConfig),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        PrismaService,
        LocalStrategy,
        JwtStrategy,
        RefreshStrategy,
        GoogleStrategy,
    ],
})
export class AuthModule {}
