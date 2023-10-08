import {
  Logger,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
import {
  Connection,
  Keypair,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import axios, { AxiosInstance } from 'axios';
import * as bs58 from 'bs58';
import {
  IGetCollectionResponse,
  ICreateNFTCollectionForm,
} from '../interface/shyft-web3.type';

@Injectable()
export class ShyftWeb3Service {
  private readonly network: string;
  private readonly creatorWalletAddress: string;
  private readonly creatorPrivateKey: string;
  private readonly merkleTreeAddress: string;

  private readonly axiosInstance: AxiosInstance;

  constructor() {
    //
    const {
      NETWORK,
      CREATOR_WALLET_ADDRESS,
      CREATOR_PRIVATE_KEY,
      MERKLE_TREE_ADDRESS,
      SHYFT_API_BASE_URL,
      SHYFT_API_KEY,
    } = process.env;

    this.network = NETWORK;
    this.creatorWalletAddress = CREATOR_WALLET_ADDRESS;
    this.creatorPrivateKey = CREATOR_PRIVATE_KEY;
    this.merkleTreeAddress = MERKLE_TREE_ADDRESS;

    this.axiosInstance = axios.create({
      headers: { 'x-api-key': SHYFT_API_KEY },
      baseURL: SHYFT_API_BASE_URL,
    });
  }

  protected readonly logger = new Logger(ShyftWeb3Service.name);

  private async signTransaction(
    encodedTransaction: string,
    fromPrivateKey: string,
  ): Promise<string> {
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const feePayer = Keypair.fromSecretKey(bs58.decode(fromPrivateKey));
      const recoveredTransaction = Transaction.from(
        Buffer.from(encodedTransaction, 'base64'),
      );
      recoveredTransaction.partialSign(feePayer);

      const txnSignature = await connection.sendRawTransaction(
        recoveredTransaction.serialize(),
      );

      return txnSignature;
    } catch (error) {
      this.logger.error(__filename, error);
    }
    throw new InternalServerErrorException('Sign transaction failed');
  }

  /**
   * @api: https://docs.shyft.to/start-hacking/nft#create-v2
   * dùng API ver2 có thể config payer
   */
  public async mintCollectionNFT(
    metadata: ICreateNFTCollectionForm,
  ): Promise<{ txnSignature: string; address: string }> {
    try {
      // const buffer = fs.readFileSync(
      //   path.resolve(__dirname, '../../../', metadata.imageRelativePath),
      // );
      const blob = new Blob([metadata.imageBuffer]);
      const formdata = new FormData();
      formdata.append('network', this.network);
      formdata.append('creator_wallet', this.creatorWalletAddress);
      formdata.append('name', metadata.name);
      formdata.append('symbol', metadata.symbol);
      formdata.append('description', metadata.description);
      formdata.append('attributes', JSON.stringify(metadata.attributes));
      formdata.append('external_url', metadata.externalUrl);
      formdata.append('max_supply', '0');
      formdata.append('royalty', '1');
      formdata.append(
        'receiver',
        metadata.receiver || this.creatorWalletAddress,
      );
      formdata.append('image', blob);
      formdata.append('fee_payer', metadata.payer || this.creatorWalletAddress);

      const res = await this.axiosInstance.post('/sol/v2/nft/create', formdata);
      if (res.data) {
        const encodedTransaction = res.data.result.encoded_transaction;

        const txnSignature = await this.signTransaction(
          encodedTransaction,
          this.creatorPrivateKey,
        );

        return {
          txnSignature,
          address: res.data.result.mint,
        };
      }
    } catch (error) {
      this.logger.error(__filename, error);
    }
    throw new InternalServerErrorException('Failed to mint collection');
  }

  public async mintCNFTToWalletAddress(params: {
    receiverAddress: string;
    metadataUri: string;
    collectionAddress: string;
  }): Promise<string> {
    try {
      const res = await this.axiosInstance.post('/sol/v1/nft/compressed/mint', {
        network: this.network,
        creator_wallet: this.creatorWalletAddress,
        metadata_uri: params.metadataUri,
        merkle_tree: this.merkleTreeAddress,
        collection_address: params.collectionAddress,
        max_supply: 0,
        receiver: params.receiverAddress,
        fee_payer: this.creatorWalletAddress,
      });

      if (res.data) {
        const encodedTransaction = res.data.result.encoded_transaction;

        const txnSignature = await this.signTransaction(
          encodedTransaction,
          this.creatorPrivateKey,
        );

        return txnSignature;
      }
    } catch (error) {
      console.log(error);
      this.logger.error('mintCNFTToWalletAddress', error);
    }

    throw new InternalServerErrorException('Failed to mint cNFT');
  }

  public async getCollectionByAddress(
    tokenAddress: string,
  ): Promise<IGetCollectionResponse> {
    try {
      const res = await this.axiosInstance.get(`/sol/v1/nft/read`, {
        params: {
          network: this.network,
          token_address: tokenAddress,
        },
      });

      if (res.data) {
        return res.data.result;
      }
    } catch (error) {
      this.logger.error(__filename, error);
    }
    throw new InternalServerErrorException('Failed to get Collection');
  }

  public async getCNFT(walletAddress?: string, collectionAddress?: string) {
    try {
      const res = await this.axiosInstance.get(
        '/sol/v1/nft/compressed/read_all',
        {
          params: {
            network: this.network,
            wallet_address: walletAddress,
            collectionAddress: collectionAddress,
          },
        },
      );

      if (res.data) {
        const userCNFTs = res.data.result.nfts;

        return {
          pageIndex: 1,
          pageSize: userCNFTs.length,
          items: userCNFTs.map((nft) => {
            console.log(nft);
            return {
              nftId: nft.nft_id,
              name: nft.name,
              description: nft.description,
              image: nft.image_uri,
              externalUrl: nft.external_url,
              metadataUri: nft.metadata_uri,
            };
          }),
        };
      }
    } catch (error) {
      console.log(error);
      this.logger.error('getCNFTByWalletAddress', error);
    }

    throw new InternalServerErrorException('Failed to mint NFT');
  }
}
