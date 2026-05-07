export interface IUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export type ApiResponse<T = Record<string, unknown>> = {
  success: boolean;
  message: string;
} & T;

export interface IAuthData {
  user: IUser;
}
