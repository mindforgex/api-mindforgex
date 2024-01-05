export enum Status {
  public = 'public',
  notPublic = 'notPublic',
}

export const SORT_CONDITION = {
  LATEST_UPDATE: { updatedAt: -1 },
  OLDEST_UPDATE: { updatedAt: 1 },
  LATEST_CREATE: { createdAt: -1 },
  OLDEST_CREATE: { createdAt: 1 },
};