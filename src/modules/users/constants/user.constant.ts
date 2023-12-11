export enum Role {
  admin = 'admin',
  commonUser = 'commonUser',
  channelUser = 'channelUser',
}

export enum UserStatus {
  active = 'active',
  inactive = 'inactive',
  blocked = 'blocked',
}

export enum UserType {
  koc = '1',
  user = '2',
}

export enum PasswordResetStatus {
  confirmed = 'confirmed',
  unconfirmed = 'unconfirmed',
}

export const MIN_PASSWORD_LENGTH = 8;

export const DEFAULT_USER_NONCE = 1;

export const SORT_CONDITION = {
  LATEST_UPDATE: { updatedAt: -1 },
  OLDEST_UPDATE: { updatedAt: 1 },
};
