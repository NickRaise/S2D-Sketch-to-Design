export interface IUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface IApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  data: T;
}

export interface IAuthData {
  user: IUser;
}
