import { client } from '@app-launch-kit/modules/init/supabase/supabaseClient';
import {
  IAuthService,
  IGetSessionResponse,
  IAuthResponse,
  ISignOutResponse,
  IOnAuthStateChangeResponse,
  IUpdateUserResponse,
  IResetPasswordResponse,
  ISendOTPResponse,
} from '@app-launch-kit/modules/auth/types/IAuthProvider';

export const Service: IAuthService = {
  async signUpWithEmailPassword(
    email: string,
    password: string
  ): Promise<IAuthResponse> {
    try {
      const originalResponse = await client.auth.signUp({ email, password });

      const response: any = {
        _original: originalResponse,
        data: {
          user: originalResponse.data.user
            ? {
                id: originalResponse.data.user.id,
                email: originalResponse.data.user.email || '',
              }
            : null,
          session: originalResponse.data.session
            ? {
                access_token: originalResponse.data.session.access_token,
                refresh_token: originalResponse.data.session.refresh_token,
              }
            : null,
        },
        error: originalResponse.error
          ? {
              status: originalResponse.error.status || 500,
              message: originalResponse.error.message,
            }
          : null,
      };

      return { ...response };
    } catch (err: any) {
      const response: any = {
        _original: null,
        data: {
          user: null,
          session: null,
        },
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
      return { ...response };
    }
  },

  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<IAuthResponse> {
    try {
      const originalResponse = await client.auth.signInWithPassword({
        email,
        password,
      });

      const response: any = {
        _original: originalResponse,
        data: {
          user: originalResponse.data?.user
            ? {
                id: originalResponse.data.user.id,
                email: originalResponse.data.user.email || '',
              }
            : null,
          session: originalResponse.data?.session
            ? {
                access_token: originalResponse.data.session.access_token,
                refresh_token: originalResponse.data.session.refresh_token,
              }
            : null,
        },
        error: originalResponse.error
          ? {
              status: originalResponse.error.status || 500,
              message: originalResponse.error.message,
            }
          : null,
      };

      return { ...response };
    } catch (err: any) {
      const response: any = {
        _original: null,
        data: {
          user: null,
          session: null,
        },
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
      return { ...response };
    }
  },

  async sendOTP(phoneNumber: string): Promise<ISendOTPResponse> {
    const verifyOTP = async (otp: string): Promise<IAuthResponse> => {
      try {
        const originalResponse = await client.auth.verifyOtp({
          phone: phoneNumber,
          token: otp,
          type: 'sms',
        });

        const response: any = {
          _original: originalResponse,
          data: {
            user: originalResponse.data?.user
              ? {
                  id: originalResponse.data.user.id,
                  email: originalResponse.data.user.email || '',
                }
              : null,
            session: originalResponse.data?.session
              ? {
                  access_token: originalResponse.data.session.access_token,
                  refresh_token: originalResponse.data.session.refresh_token,
                }
              : null,
          },
          error: originalResponse.error
            ? {
                status: originalResponse.error.status || 500,
                message: originalResponse.error.message,
              }
            : null,
        };

        return { ...response };
      } catch (err: any) {
        return {
          _original: null,
          data: {
            user: null,
            session: null,
          },
          error: {
            status: err.status || 500,
            message: err.message || 'Invalid code.',
          },
        };
      }
    };

    try {
      const confirmationResult = await client.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (confirmationResult.error) {
        return {
          _original: null,
          data: null,
          error: {
            status: confirmationResult.error.status || 500,
            message: confirmationResult.error.message,
          },
        };
      }
      return {
        data: {
          verifyOTP,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        _original: null,
        data: null,
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
    }
  },

  async signOut(): Promise<ISignOutResponse> {
    try {
      const { error } = await client.auth.signOut();

      if (error) {
        return {
          error: {
            status: error.status || 500,
            message: error.message,
          },
        };
      }

      return { error: null };
    } catch (err: any) {
      return {
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
    }
  },

  async resetPassword(
    email: string,
    redirectTo: string
  ): Promise<IResetPasswordResponse> {
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        return {
          error: {
            status: error.status || 500,
            message: error.message,
          },
        };
      }

      return { error: null };
    } catch (err: any) {
      return {
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
    }
  },

  async getSession(): Promise<IGetSessionResponse> {
    try {
      const { data, error } = await client.auth.getSession();

      if (error) {
        return {
          data: { session: null },
          error: {
            status: error.status || 500,
            message: error.message || 'An unexpected error occurred.',
          },
        };
      }

      return {
        _original: data,
        data: {
          session: data.session
            ? {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                user: data.session.user
                  ? {
                      id: data.session.user.id,
                      email: data.session.user.email || '',
                    }
                  : null,
              }
            : null,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        data: { session: null },
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
    }
  },

  async setSession(
    params: any
    // accessToken: string,
    // refreshToken: string
  ): Promise<IAuthResponse> {
    try {
      const originalResponse = await client.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });

      const response: any = {
        _original: originalResponse,
        data: {
          user: originalResponse.data?.user
            ? {
                id: originalResponse.data.user.id,
                email: originalResponse.data.user.email || '',
              }
            : null,
          session: originalResponse.data?.session
            ? {
                access_token: originalResponse.data.session.access_token,
                refresh_token: originalResponse.data.session.refresh_token,
              }
            : null,
        },
        error: originalResponse.error
          ? {
              status: originalResponse.error.status || 500,
              message: originalResponse.error.message,
            }
          : null,
      };

      return { ...response };
    } catch (err: any) {
      const response: any = {
        _original: null,
        data: {
          user: null,
          session: null,
        },
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
      return { ...response };
    }
  },

  async updateUser(updateData: {
    email?: string;
    password?: string;
  }): Promise<IUpdateUserResponse> {
    try {
      const originalResponse = await client.auth.updateUser(updateData);

      const response: any = {
        _original: originalResponse,
        data: {
          user: originalResponse.data?.user
            ? {
                id: originalResponse.data.user.id,
                email: originalResponse.data.user.email || '',
              }
            : null,
        },
        error: originalResponse.error
          ? {
              status: originalResponse.error.status || 500,
              message: originalResponse.error.message,
            }
          : null,
      };

      return { ...response };
    } catch (err: any) {
      const response: any = {
        _original: null,
        data: {
          user: null,
        },
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
      return { ...response };
    }
  },

  async signInWithIdToken(
    provider: string,
    idToken: string
  ): Promise<IAuthResponse> {
    try {
      const originalResponse = await client.auth.signInWithIdToken({
        provider,
        token: idToken,
      });

      const response: any = {
        _original: originalResponse,
        data: {
          user: originalResponse.data?.user
            ? {
                id: originalResponse.data.user.id,
                email: originalResponse.data.user.email || '',
              }
            : null,
          session: originalResponse.data?.session
            ? {
                access_token: originalResponse.data.session.access_token,
                refresh_token: originalResponse.data.session.refresh_token,
              }
            : null,
        },
        error: originalResponse.error
          ? {
              status: originalResponse.error.status || 500,
              message: originalResponse.error.message,
            }
          : null,
      };

      return response;
    } catch (err: any) {
      const response: any = {
        _original: null,
        data: {
          user: null,
          session: null,
        },
        error: {
          status: err.status || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
      return response;
    }
  },

  onAuthStateChange(
    callback: (event: string, session: any) => void
  ): Promise<IOnAuthStateChangeResponse> {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    const response: IOnAuthStateChangeResponse = {
      subscription,
      unsubscribe: () => subscription.unsubscribe(),
    };

    return Promise.resolve(response);
  },
};
