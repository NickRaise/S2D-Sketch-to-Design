export interface ISignUpResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface GoogleOAuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}
