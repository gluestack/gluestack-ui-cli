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
import { store } from '@app-launch-kit/modules/auth/store';
import auth from '@react-native-firebase/auth';

export const Service: IAuthService = {
  async signUpWithEmailPassword(
    email: string,
    password: string
  ): Promise<IAuthResponse> {
    try {
      const originalResponse = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      const user = originalResponse.user!;
      const accessToken = await user.getIdToken();

      const response: any = {
        _original: originalResponse,
        data: {
          user: {
            id: user.uid,
            email: user.email,
          },
          session: {
            access_token: accessToken,
            refresh_token: '',
          },
        },
        error: null,
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
      const originalResponse = await auth().signInWithEmailAndPassword(
        email,
        password
      );

      const user = originalResponse.user!;
      const accessToken = await user.getIdToken();

      const response: any = {
        _original: originalResponse,
        data: {
          user: {
            id: user.uid,
            email: user.email,
          },
          session: {
            access_token: accessToken,
            refresh_token: '',
          },
        },
        error: null,
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
    try {
      const confirmationResult =
        await auth().signInWithPhoneNumber(phoneNumber);

      const verifyOTP = async (otp: string): Promise<IAuthResponse> => {
        try {
          const originalResponse = await confirmationResult.confirm(otp);
          const user = originalResponse?.user!;
          const accessToken = await user.getIdToken();

          const response: any = {
            _original: originalResponse,
            data: {
              user: {
                id: user.uid,
                email: user.email,
              },
              session: {
                access_token: accessToken,
                refresh_token: '',
              },
            },
            error: null,
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
      };
      return { data: { verifyOTP }, error: null };
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
      await auth().signOut();

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
      const actionCodeSettings = {
        url: redirectTo,
        handleCodeInApp: true,
      };
      await auth().sendPasswordResetEmail(email, actionCodeSettings);

      return { error: null };
    } catch (err: any) {
      return {
        error: {
          status: err.code || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
    }
  },

  async getSession(): Promise<IGetSessionResponse> {
    try {
      const user = auth().currentUser;
      if (user) {
        const accessToken = await user.getIdToken();
        return {
          _original: user,
          data: {
            session: {
              access_token: accessToken,
              refresh_token: '',
              user: {
                id: user.uid,
                email: user.email || '',
              },
            },
          },
          error: null,
        };
      }

      return {
        data: {
          session: null,
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

  async setSession(params: any): Promise<IAuthResponse> {
    try {
      const oobCode = params.oobCode;
      await store.set('firebase', { oobCode });
      const response: any = {
        _original: null,
        data: {
          user: null,
          session: {
            access_token: params?.oobCode,
            refresh_token: '',
          },
        },
        error: null,
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
      const { oobCode } = await store.get('firebase');
      await auth().confirmPasswordReset(oobCode, updateData.password!);

      return {
        _original: null,
        data: {
          user: null,
        },
        error: null,
      };
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
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const originalResponse =
        await auth().signInWithCredential(googleCredential);

      const user = originalResponse.user!;
      const accessToken = await user.getIdToken();

      const response: any = {
        _original: originalResponse,
        data: {
          user: {
            id: user.uid,
            email: user.email,
          },
          session: {
            access_token: accessToken,
            refresh_token: '',
          },
        },
        error: null,
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
          status: err.code || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
      return { ...response };
    }
  },

  async onAuthStateChange(callback: (event: string, session: any) => void) {
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        const accessToken = await user.getIdToken();
        const session = {
          access_token: accessToken,
          refresh_token: '',
          user: {
            id: user.uid,
            email: user.email,
          },
        };
        callback('SIGNED_IN', session);
      } else {
        callback('SIGNED_OUT', {
          access_token: null,
          refresh_token: null,
          user: null,
        });
      }
    });

    const response: IOnAuthStateChangeResponse = {
      subscription: {},
      unsubscribe: () => {},
    };

    return response;
  },
};
