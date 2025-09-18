// src/models/User.ts
export class User {
  constructor(
    public id: number | null,
    public name: string,
    public email: string,
    private password: string,
    public createdAt: Date = new Date(),
  ) {}

  public checkPassword(pass: string): boolean {
    return this.password === pass;
  }

  public toPersistence() {
    return {
      id: this.id ?? undefined,
      name: this.name,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
    };
  }
}
