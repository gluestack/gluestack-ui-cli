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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  confirmPasswordReset,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
// Google Auth Provider
import { GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@app-launch-kit/modules/init/firebase/firebaseClient.web';
import { store } from '@app-launch-kit/modules/auth/store';

export const Service: IAuthService = {
  async signUpWithEmailPassword(
    email: string,
    password: string
  ): Promise<IAuthResponse> {
    try {
      const originalResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = originalResponse.user;
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
            refresh_token: user.refreshToken,
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
      const originalResponse = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = originalResponse.user;
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
            refresh_token: user.refreshToken,
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
      // @ts-ignore
      if (!window.recaptchaVerifier) {
        const recaptchaVerifier = new RecaptchaVerifier(
          // @ts-ignore
          auth,
          'recaptcha-container',
          {
            'size': 'invisible',
            'callback': (response: any) => {
              console.log('recaptcha verification callback', response);
            },
            'expired-callback': (response: any) => {
              console.log('recaptcha expired callback', response);
            },
          }
        );
        // @ts-ignore
        window.recaptchaVerifier = recaptchaVerifier;
      }
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        // @ts-ignore
        window.recaptchaVerifier
      );
      const verifyOTP = async (otp: string) => {
        try {
          const originalResponse = await confirmationResult.confirm(otp);

          const user = originalResponse.user;
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
                refresh_token: user.refreshToken,
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
      await signOut(auth);

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
      await sendPasswordResetEmail(auth, email, actionCodeSettings);

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
      const user = auth.currentUser;
      if (user) {
        const accessToken = await user.getIdToken();
        return {
          _original: user,
          data: {
            session: {
              access_token: accessToken,
              refresh_token: user.refreshToken,
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
      await confirmPasswordReset(auth, oobCode, updateData.password!);

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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const credential = GoogleAuthProvider.credentialFromResult(result)!;
      const token = credential.accessToken;
      const user = result.user;
      const response: any = {
        _original: result,
        data: {
          user: {
            id: user.uid,
            email: user.email || '',
          },
          session: {
            access_token: token,
            refresh_token: user.refreshToken,
          },
        },
        error: null,
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
          status: err.code || 500,
          message: err.message || 'An unexpected error occurred.',
        },
      };
      return { ...response };
    }
  },

  async onAuthStateChange(callback: (event: string, session: any) => void) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const accessToken = await user.getIdToken();
        const session = {
          access_token: accessToken,
          refresh_token: user.refreshToken,
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
