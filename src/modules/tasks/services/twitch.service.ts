import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TwitchService {
  private readonly logger = new Logger(TwitchService.name);
  private readonly axiosInstance = axios.create({
    headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID },
    baseURL: 'https://api.twitch.tv/helix',
  });

  getFollowedChannel = async (accessToken: string, userId: string) => {
    const { data } = await this.axiosInstance.get('/channels/followed', {
      params: {
        user_id: userId,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data;
  };

  public verifyFollowChannel = async (
    targetTwitchLogin: string,
    userTwitchId: string,
    userTwitchAccessToken: string,
  ) => {
    let isValid = false;
    try {
      const followedChannels = await this.getFollowedChannel(
        userTwitchAccessToken,
        userTwitchId,
      );
      if (followedChannels?.total === 0) return isValid;

      isValid = followedChannels.data.some(
        (_channel) => _channel.broadcaster_login === targetTwitchLogin,
      );
    } catch (e) {
      this.logger.error('error', e);
    }
    return isValid;
  };

  public getUser = async (accessToken: string, userId: string) => {
    const {
      data: { data: users },
    } = await this.axiosInstance.get(`/users`, {
      params: { login: userId },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const [user] = users;
    return user;
  };
}
