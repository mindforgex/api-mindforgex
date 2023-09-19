import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/modules/users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './services/jwt.strategy';
import { OptionalJwtStrategy } from './services/optional-jwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: Number(process.env.JWT_EXPIRE_SECONDS),
        },
      }),
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OptionalJwtStrategy],
  exports: [],
})
export class AuthModule {}
