import { db } from "../database";
import { CreateUserData, UpdateUserData } from "../types/user";
export class UserRepository {
  async findById(id: number) {
    return await db
      .selectFrom("users")
      .where("id", "=", id)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();
  }
  async findByUsername(username: string) {
    return await db
      .selectFrom("users")
      .select(["id", "username", "password", "created_at"])
      .where("username", "=", username)
      .executeTakeFirst();
  }
  async deleteUser(id: number) {
    return await db
      .deleteFrom("users")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
  async createUser(data: CreateUserData) {
    return await db
      .insertInto("users")
      .values({ username: data.username, password: data.password })
      .returning(["id", "username", "created_at"])
      .executeTakeFirstOrThrow();
  }
  async updateUser(id: number, data: UpdateUserData) {
    return await db
      .updateTable("users")
      .set(data)
      .where("id", "=", id)
      .returning(["id", "username", "created_at"]) // never return password
      .executeTakeFirst();
  }
}