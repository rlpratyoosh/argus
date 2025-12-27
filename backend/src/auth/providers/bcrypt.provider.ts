import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashingProvider {
  hash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
  compare(data: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(data, hashed);
  }
}
