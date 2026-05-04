export interface IUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export type IApiResponse<T = Record<string, unknown>> = {
  success: boolean;
  message: string;
} & T;

export interface IAuthData {
  user: IUser;
}
