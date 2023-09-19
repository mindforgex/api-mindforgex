import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/auth.interface';

import { AuthService } from './auth.service';

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(
  Strategy,
  'optional-jwt',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const { userId, nonce } = payload;
    const user = await this.authService.verify(userId, nonce);

    return user;
  }
}
