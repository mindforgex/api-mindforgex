export const SORT_CONDITION = {
  LATEST_UPDATE: { updatedAt: -1 },
  OLDEST_UPDATE: { updatedAt: 1 },
};

export enum TASK_TYPE {
  SUBSCRIBE_WEB3_CHANNEL = 'SUBSCRIBE_WEB3_CHANNEL',
  JOIN_DISCORD = 'JOIN_DISCORD',
  SUBSCRIBE_TWITCH = 'SUBSCRIBE_TWITCH',
  SUBSCRIBE_YOUTUBE = 'SUBSCRIBE_YOUTUBE',
}

export enum TaskStatus {
  active = 'active',
  inactive = 'inactive',
}
