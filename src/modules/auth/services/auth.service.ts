import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bs58 from 'bs58';
import * as nacl from 'tweetnacl';

import { JwtPayload } from '../interfaces/auth.interface';

import { UserStatus } from 'src/modules/users/constants/user.constant';
import { UserService } from 'src/modules/users/services/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private verifyLoginSignature = async (
    walletAddress: string,
    message: string,
    signature: string,
  ) => {
    // Verify the message
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(walletAddress),
    );

    return verified;
  };

  private generateJwtToken(payload: JwtPayload) {
    return `Bearer ${this.jwtService.sign(payload)}`;
  }

  private async upsertAndGenerateToken(walletAddress: string) {
    const userUpdated = await this.userService.findByWalletAddressAndUpsert(
      walletAddress,
      {
        $inc: { nonce: 1 },
        lastConnectedTime: new Date(),
      },
    );

    const {
      _id,
      nonce: nonceUpdated,
      role,
      // hasDiscord,
      discordId,
      discordUsername,
      registratorToken,
      status,
      userType,
    } = userUpdated;
    const jwtParams = {
      userId: _id,
      walletAddress,
      role,
      nonce: nonceUpdated,
      status,
      userType,
    };

    return {
      accessToken: this.generateJwtToken(jwtParams),
      user: {
        ...jwtParams,
        // hasDiscord,
        discordId,
        discordUsername,
        registratorToken,
        status,
        userType,
      },
    };
  }

  private async findActiveUserById(userId: string) {
    const user = await this.userService.findOneById(userId, '');
    if (!user) throw new NotFoundException('User is not found.');
    if (user.status === UserStatus.blocked)
      throw new ForbiddenException('User has been blocked.');

    return user;
  }

  async signin(
    walletAddress: string,
    message: string,
    signature: string,
  ): Promise<{
    accessToken: string;
    user: any;
  }> {
    const isValid = await this.verifyLoginSignature(
      walletAddress,
      message,
      signature,
    );
    if (!isValid) throw new BadRequestException('Invalid signature.');

    const result = await this.upsertAndGenerateToken(walletAddress);

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
}
