import argon2 from 'argon2';

export class Crypto {
  static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}
