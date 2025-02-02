import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'

import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard'

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
        return req.user
    }
}
