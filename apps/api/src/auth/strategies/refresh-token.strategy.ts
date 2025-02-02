import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import type { ConfigType } from '@nestjs/config'
import { ExtractJwt, Strategy } from 'passport-jwt'

import jwtConfig from '../config/jwt.config'
import type { AuthJwtPayload } from '../types/auth-jwt-payload'
import { AuthService } from '../auth.service'
import refreshConfig from '../config/refresh.config'

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor(
        @Inject(refreshConfig.KEY)
        private refreshTokenConfiguration: ConfigType<typeof refreshConfig>,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
            secretOrKey: refreshTokenConfiguration.secret,
            ignoreExpiration: false,
        })
    }

    validate(payload: AuthJwtPayload) {
        const userId = payload.sub
        return this.authService.validateRefreshToken(userId)
    }
}
