export const SORT_CONDITION = {
  LATEST_UPDATE: { updatedAt: -1 },
  OLDEST_UPDATE: { updatedAt: 1 },
};

export enum Role {
  admin = 'admin',
  commonUser = 'commonUser',
}
