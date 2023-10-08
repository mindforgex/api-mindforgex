import { JsonMetadata } from './wrapped-solana-connection.type';

export interface Attributes {
  [key: string]: string | number;
}

export interface IGetCollectionResponse {
  name: string;
  symbol: string;
  royalty: number;
  image_uri: string;
  cached_image_uri: string;
  animation_url: string;
  cached_animation_url: string;
  metadata_uri: string;
  description: string;
  mint: string;
  owner: string;
  update_authority: string;
  creators: JsonMetadata['properties']['creators'];
  collection: JsonMetadata['collection'];
  attributes: Attributes;
  attributes_array: JsonMetadata['attributes'];
  files: JsonMetadata['properties']['files'];
  external_url: string;
  is_loaded_metadata: boolean;
  primary_sale_happened: boolean;
  is_mutable: boolean;
  token_standard: string;
  is_compressed: boolean;
  merkle_tree: string;
}

export interface ICreateNFTCollectionForm extends JsonMetadata {
  imageBuffer?: Buffer;
  payer?: string;
  externalUrl?: string;
  receiver?: string;
}
