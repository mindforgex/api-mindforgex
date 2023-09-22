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
  ): Promise<any> {
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
      console.log(error);
    }
  }

  public async mintCNFTToWalletAddress(params: {
    receiverAddress: string;
    metadataUri: string;
  }) {
    try {
      const res = await this.axiosInstance.post('/sol/v1/nft/compressed/mint', {
        network: this.network,
        creator_wallet: this.creatorWalletAddress,
        merkle_tree: this.merkleTreeAddress,
        metadata_uri: params.metadataUri,
        receiver: params.receiverAddress,
      });

      if (res.data) {
        const encodedTransaction = res.data.result.encoded_transaction;

        const txnSignature = await this.signTransaction(
          encodedTransaction,
          this.creatorPrivateKey,
        );

        return { txnSignature };
      }
    } catch (error) {
      console.log(error);
      this.logger.error('mintCNFTToWalletAddress', error);
    }

    throw new InternalServerErrorException('Failed to mint NFT');
  }

  public async getCNFTByWalletAddress(walletAddress: string) {
    try {
      const res = await this.axiosInstance.get(
        '/sol/v1/nft/compressed/read_all',
        {
          params: {
            network: this.network,
            wallet_address: walletAddress,
          },
        },
      );

      if (res.data) {
        const userCNFTs = res.data.result.nfts;

        // console.log('userCNFTs', userCNFTs);

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
