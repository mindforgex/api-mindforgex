import * as dotenv from 'dotenv';
dotenv.config();

const { NODE_ENV } = process.env;

export const REGEX_VALIDATOR = {
  NOT_CONTAIN_SPECIAL_CHARACTER: /^[^!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+$/,
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  // URL: /(https?:\/\/)?([\da-z\.-]+)\.([a-z]{2,6})([\/\w\.-]*)*\/?/,
  URL: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
  ALPHA_BET: /^[a-zA-Z0-9]*$/,
};

export const DEFAULT_RESPONSE_SUCCESS = {
  message: 'Success',
};

export const DEFAULT_PAGE_INDEX = 1;
export const DEFAULT_PAGE_SIZE = 12;

export enum NETWORK {
  POLYGON = 'POLYGON',
}

export const NETWORK_CHAIN_ID = {
  // ETH = NODE_ENV === 'production' ? 1 : 5, // 5: Goerli
  [NETWORK.POLYGON]: NODE_ENV === 'production' ? 137 : 80001,
};
