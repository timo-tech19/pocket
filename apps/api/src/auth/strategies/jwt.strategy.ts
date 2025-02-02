import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import type { ConfigType } from '@nestjs/config'
import { ExtractJwt, Strategy } from 'passport-jwt'

import jwtConfig from '../config/jwt.config'
import type { AuthJwtPayload } from '../types/auth-jwt-payload'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConfig.KEY)
        private jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfiguration.secret,
            ignoreExpiration: false,
        })
    }

    validate(payload: AuthJwtPayload) {
        const userId = payload.sub
        return this.authService.validateJwtUsr(userId)
    }
}
