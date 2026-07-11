import bcrypt from "bcrypt";
import { UserRepository } from "../repository/user.repository";
import { signToken } from "../shared/jwt";
import { conflictError, UnauthorizedError } from "../shared/errors";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";

const SALT_ROUNDS = 12;

const userRepository = new UserRepository();

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByUsername(input.username);
    if (existingUser) {
      throw new conflictError("Username is already Taken");
    }
    const hash_password = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.createUser({
      username: input.username,
      password: hash_password,
    });

    const token = signToken({ userId: user.id, username: user.username });
    return { user, token };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByUsername(input.username);
    if (!user) {
      throw new UnauthorizedError(
        "Invalid username or password please try again",
      );
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedError(
        "Invalid username or password please try again",
      );
    }
    const token = signToken({ userId: user.id, username: user.username });
    return {
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
      },
      token,
    };
  }
}
