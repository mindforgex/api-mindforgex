import fs from 'fs';
import path from 'path';

export const updateSeedData = (targetRelativePath: string, data: object) => {
  const sourcePath = path.resolve(__dirname, '../../', targetRelativePath);
  fs.writeFileSync(sourcePath, JSON.stringify(data), { encoding: 'utf-8' });
};
