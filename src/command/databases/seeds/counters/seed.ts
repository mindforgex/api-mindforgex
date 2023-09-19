import { Module, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { program } from 'commander';

program
  .requiredOption('--collectionId <collectionId>', 'Collection ID')
  .parse(process.argv);
const cliArgs = program.opts();

const { collectionId } = cliArgs;

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
})
class CommandModule {}

export const seedCounter = async () => {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(CommandModule);
  console.log('Seed counter successfully');
  await app.close();
  process.exit(0);
};

seedCounter();
