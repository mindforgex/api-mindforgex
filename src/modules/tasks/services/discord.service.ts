import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Client, GatewayIntentBits } from 'discord.js';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DiscordService.name);

  private readonly client: Client;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
    });

    this.client.on('ready', () => {
      this.logger.log('Discord bot already');
    });
  }

  async onApplicationBootstrap() {
    await this.client
      .login(process.env.DISCORD_BOT_TOKEN)
      .catch(() => this.logger.error('Discord bot login failed'));
  }

  public verifyDiscordTask = async (userDiscordId: string, guildId: string) => {
    try {
      const guild = this.client.guilds.cache.get(guildId);

      if (!guild) return false;

      const allMembers = await guild.members.fetch();

      return !!allMembers.find((e) => e.user.id === userDiscordId);
    } catch (e) {
      this.logger.error('error', e);
    }

    return false;
  };
}
