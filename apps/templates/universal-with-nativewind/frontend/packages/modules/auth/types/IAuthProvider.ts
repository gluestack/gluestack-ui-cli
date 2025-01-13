// Common interfaces
export interface IUser {
  id: string;
  email: string;
}

export interface ISession {
  access_token: string;
  refresh_token: string;
}

export interface IErrorResponse {
  status: number;
  message: string;
}

export interface IBaseResponse {
  _original?: any;
  error: IErrorResponse | null;
}

export interface IAuthResponse extends IBaseResponse {
  data: {
    user: IUser | null;
    session: ISession | null;
  };
}

export interface ISignOutResponse extends IBaseResponse {}

export interface IResetPasswordResponse extends IBaseResponse {
  data?: any;
}

export interface IGetSessionResponse extends IBaseResponse {
  data: {
    session: (ISession & { user: IUser | null }) | null;
  };
}

export interface IUpdateUserResponse extends IBaseResponse {
  data: {
    user: IUser | null;
  };
}

export interface IOnAuthStateChangeResponse {
  subscription: any;
  unsubscribe: () => void;
}
export type IVerifyOTPFunction = (otp: string) => Promise<IAuthResponse>;

export interface ISendOTPResponse extends IBaseResponse {
  data: {
    verifyOTP: IVerifyOTPFunction;
  } | null;
}

// Main service interface
export interface IAuthService {
  callback?: (event: string, session: any) => void;
  signUpWithEmailPassword(
    email: string,
    password: string
  ): Promise<IAuthResponse>;
  signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<IAuthResponse>;
  sendOTP(phoneNumber: string): Promise<ISendOTPResponse>;
  signOut(): Promise<ISignOutResponse>;
  resetPassword(
    email: string,
    redirectTo: string
  ): Promise<IResetPasswordResponse>;

  setSession(
    // accessToken: string,
    // refreshToken: string
    params: any
  ): Promise<IAuthResponse>;

  getSession(): Promise<IGetSessionResponse>;
  updateUser(updateData: {
    email?: string;
    password?: string;
  }): Promise<IUpdateUserResponse>;
  signInWithIdToken(
    provider?: string,
    idToken?: string
  ): Promise<IAuthResponse>;
  onAuthStateChange(
    callback: (event: string, session: any) => void
  ): Promise<IOnAuthStateChangeResponse>;
}
