# AppLaunchKit

AppLaunchKit is a powerful and flexible starter kit designed for building universal applications. It combines Expo for mobile development and Next.js for web applications, providing a unified codebase for apps that run seamlessly on iOS, Android, and the web.

## Key Features

- **Cross-Platform Development**: Build for multiple platforms using a single, shared codebase.
- **Modular Monorepo Structure**: Organized architecture with dedicated sections for Expo and Next.js apps, plus shared resources.
- **Expo and Next.js Integration**: Leverages Expo's tools for mobile and Next.js optimizations for web.
- **Shared Resources**: Centralized repository for reusable components, UI elements, hooks, and services.
- **Modules**: Includes modules for Authentication, User-Profile, File-Upload,Notifications, Dashboard, Landing-Page, each module is a self-contained entity with its own assets, components, hooks, and other necessary files.
- **Authentication Solutions**: Includes NextAuth.js and Expo Auth Session for secure user authentication.
- **Notifications**: Includes push notifications for native apps.
- **Database**: Includes database for user-profile and file-upload modules.
- **Storage**: Includes storage for file-upload module.
- **Pre-built Core Features**: Comes with protected routes, email delivery integration, and Stripe integration for payments.
- **Developer Tools**: Pre-configured with Storybook, ESLint, and Prettier for improved development workflow.
- **TypeScript Support**: Includes TypeScript configuration for type-safe development.

AppLaunchKit provides a comprehensive foundation for your project, focusing on cross-platform compatibility, code reusability, and development efficiency. It empowers developers to build robust, scalable, and maintainable universal applications with a consistent user experience across all platforms.

## Getting Started

### Supabase Server

- Navigate to the `backend/supabase` directory from the root of the project.

  ```bash
  cd backend/supabase
  ```

- Start your Supabase local server.

  ```bash
  npx supabase@latest start
  ```

- Stop the supabase server:

  ```bash
  npx supabase@latest stop
  ```

- Reset the supabase server:

  ```bash
  npx supabase@latest db reset
  ```

For more details on the usage of these commands please read more on the official documentation page of [Supabase CLI](https://supabase.com/docs/guides/cli)

### Expo App

- Navigate to the `frontend` directory from the root of the project.

  ```bash
  cd frontend
  ```

- Start the Expo app for Android.

  ```bash
  npm run expo:android
  ```

- Start the Expo app for iOS.

  ```bash
  npm run expo:ios
  ```

### Next.js Web App

- Navigate to the `frontend` directory from the root of the project.

  ```bash
  cd frontend
  ```

- Start the Next.js app.

  ```bash
  npm run next:dev
  ```
