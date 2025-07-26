export interface AuthResponse {
  accessToken: string;
  userInfo: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
}
