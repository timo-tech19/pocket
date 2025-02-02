import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    Res,
    UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'

import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard'
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard'
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    signup(@Body() createUserDto: CreateUserDto) {
        return this.authService.signup(createUserDto)
    }

    @UseGuards(LocalAuthGuard)
    @Post('signin')
    login(@Request() req) {
        return this.authService.login(req.user.id, req.user.name)
    }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getAll(@Request() req) {
        return {
            message: `This is a protected resource; You user id is ${req.user.id}`,
        }
    }

    @UseGuards(RefreshAuthGuard)
    @Post('refresh')
    refreshToken(@Request() req) {
        return this.authService.refreshToken(req.user.id, req.user.name)
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google/login')
    googleLogin() {}

    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async googleCallback(@Request() req, @Res() res: Response) {
        const response = await this.authService.login(
            req.user.id,
            req.user.name,
        )

        res.redirect(
            `http://localhost:3000/api/auth/google/callback?userId=${response.id}&name=${response.name}&accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
        )
    }

    @UseGuards(JwtAuthGuard)
    @Post('signout')
    signOut(@Request() req) {
        return this.authService.signOut(req.user.id)
    }
}
