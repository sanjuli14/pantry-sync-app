export interface User {
  id: number;
  alias: string;
  phone: string;
  created_at: string;
}

export interface UserRegister {
  alias: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
