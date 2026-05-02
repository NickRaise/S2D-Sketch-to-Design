export interface IAuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// Not needed for now, but can be useful for future reference when we want to have more specific types for different auth responses
// export interface ISignUpResponse {
//   success: boolean;
//   message: string;
//   user: {
//     userId: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
// }

// export interface GoogleOAuthResponse {
//   success: boolean;
//   message: string;
//   user: {
//     userId: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
// }

// export interface ILoginResponse {
//   success: boolean;
//   message: string;
//   user: {
//     userId: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
// }

