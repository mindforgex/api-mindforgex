import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ClientSession } from 'mongoose';

import { JwtPayload } from '../interfaces/auth.interface';

import {
  PasswordResetStatus,
  UserStatus,
} from 'src/modules/users/constants/user.constant';
import { UserService } from 'src/modules/users/services/user.service';

import { User } from 'src/modules/users/models/user.model';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private generateJwtToken(payload: JwtPayload) {
    return `Bearer ${this.jwtService.sign(payload)}`;
  }

  private async hashPassword(password: string) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    return hashedPassword;
  }

  private async upsertAndGenerateToken(
    uniqueKey: { email?: string; twitterId?: string },
    updateParams?: Pick<
      User,
      | 'password'
      | 'googleId'
      | 'googleDisplayName'
      | 'twitterId'
      | 'twitterUsername'
    >,
  ) {
    if (!uniqueKey.email && !uniqueKey.twitterId)
      throw new BadRequestException('Email or TwitterId is required.');

    const { email, twitterId } = uniqueKey;
    const updateParamsWithNonce = {
      $inc: { nonce: 1 },
      lastConnectedTime: new Date(),
      ...updateParams,
    };

    const userUpdated = email
      ? await this.userService.findByEmailAndUpsert(
          email,
          updateParamsWithNonce,
        )
      : await this.userService.findByTwitterIdAndUpsert(
          twitterId,
          updateParamsWithNonce,
        );

    const { _id, nonce: nonceUpdated, role } = userUpdated;
    const jwtParams = {
      userId: _id,
      email: email || '',
      twitterUsername: userUpdated.twitterUsername || '',
      role,
      nonce: nonceUpdated,
    };

    return {
      accessToken: this.generateJwtToken(jwtParams),
      user: jwtParams,
    };
  }

  async signup(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) throw new BadRequestException('User is already exist.');

    const hashedPassword = await this.hashPassword(password);
    const result = await this.upsertAndGenerateToken(
      { email },
      { password: hashedPassword },
    );

    return result;
  }

  private async findActiveUserByEmail(email: string) {
    const user = await this.userService.findOneByEmail(email, '');
    if (!user) throw new NotFoundException('User is not found.');
    if (user.status === UserStatus.blocked)
      throw new ForbiddenException('User has been blocked.');

    return user;
  }

  private async findActiveUserById(userId: string) {
    const user = await this.userService.findOneById(userId, '');
    if (!user) throw new NotFoundException('User is not found.');
    if (user.status === UserStatus.blocked)
      throw new ForbiddenException('User has been blocked.');

    return user;
  }

  private async checkEmailAndPassword(email: string, password: string) {
    const user = await this.findActiveUserByEmail(email);

    const { password: hashedPassword } = user;

    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) throw new BadRequestException('Wrong password.');

    return user;
  }

  async signin(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    user: any;
  }> {
    const user = await this.checkEmailAndPassword(email, password);
    const result = await this.upsertAndGenerateToken({ email: user.email });

    return result;
  }

  async changePassword(
    email: string,
    password: string,
    newPassword: string,
  ): Promise<{
    accessToken: string;
    user: any;
  }> {
    const user = await this.checkEmailAndPassword(email, password);

    // Check duplicate password
    const isPasswordDuplicate = await bcrypt.compare(
      newPassword,
      user.password,
    );
    if (isPasswordDuplicate)
      throw new BadRequestException('New password is duplicate.');

    const result = await this.upsertAndGenerateToken(
      { email: user.email },
      {
        password: await this.hashPassword(newPassword),
      },
    );

    return result;
  }

  async verify(userId: string, nonce: number) {
    const user = await this.findActiveUserById(userId);

    if (
      process.env.ALOW_SIGNIN_ON_MULTIPLE_SITES === 'false' &&
      nonce !== user.nonce
    )
      throw new UnauthorizedException(
        'User have already logged in on other site.',
      );

    return user;
  }

  async signinGoogle(params: {
    email: string;
    googleId: string;
    googleDisplayName: string;
  }) {
    const result = await this.upsertAndGenerateToken(
      { email: params.email },
      {
        googleId: params.googleId,
        googleDisplayName: params.googleDisplayName,
      },
    );

    return result;
  }

  async signinTwitter(params: { twitterId: string; twitterUsername: string }) {
    const result = await this.upsertAndGenerateToken(
      { twitterId: params.twitterId },
      {
        twitterUsername: params.twitterUsername,
      },
    );

    return result;
  }

  public async forgotPassword(email: string, lang: string) {
    try {
      await this.findActiveUserByEmail(email);
      const passwordResetToken = randomBytes(32).toString('hex');

      await this.userService.findByEmailAndUpsert(email, {
        passwordResetStatus: PasswordResetStatus.unconfirmed,
        passwordResetToken,
        passwordResetExpiredAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      });
      const passwordResetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${passwordResetToken}`;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('User is not found or is blocked.');
    }
  }

  public async resetPassword(passwordResetToken: string, newPassword: string) {
    const hashedPassword = await this.hashPassword(newPassword);

    await this.userService.usingTransaction(async (session: ClientSession) => {
      const user = await this.userService.findUserByActivePasswordResetToken(
        passwordResetToken,
        session,
      );

      await this.userService.findByEmailAndUpsert(
        user.email,
        {
          password: hashedPassword,
          passwordResetStatus: PasswordResetStatus.confirmed,
          $inc: { nonce: 1 }, // Force user to re-login
        },
        session,
      );
    });
  }
}
