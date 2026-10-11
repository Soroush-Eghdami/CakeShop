/** Types for /api/auth/* — Authentication. */

export interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string | null;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
