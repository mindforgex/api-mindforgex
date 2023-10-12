import { INestApplicationContext, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ShyftWeb3Service } from 'src/modules/base/services/shyft-web3.service';
import { NFTInfoModule } from 'src/modules/nfts/nft.module';

@Module({
  imports: [
    NFTInfoModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const seedChannel = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);

  const shyft = new ShyftWeb3Service();

  // address of collection, view in nftcollection schema
  const collectionAddress = '2EKR2ya4GwKM5ncJQbiz24yoFLk2HN6w8jibd1ZQSSFn';
  // nft info id, view in nftinfo schema
  const nftInfoId = '652412a94e2482d55fbf4913';
  // your wallet address
  const walletAddress = 'Ekm5nndDsdYcmzRiQ2Y4n3UTvqmh1WLzKjc2hniHLtaJ';
  //
  const txnSignature = await shyft.mintCNFTToWalletAddress({
    collectionAddress: collectionAddress,
    receiverAddress: walletAddress,
    metadataUri: `${process.env.BACKEND_BASE_URL}/v1/nfts/metadata/${nftInfoId}`,
  });

  console.log(txnSignature);

  await app.close();
  process.exit(0);
};

seedChannel();
