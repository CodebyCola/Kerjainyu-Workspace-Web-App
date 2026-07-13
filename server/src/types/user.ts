export type CreateUserData = {
  username: string;
  password: string;
};

export type UpdateUserData = Partial<CreateUserData>;
