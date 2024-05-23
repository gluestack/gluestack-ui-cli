# GLUESTACK-UI CLI

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> A CLI tool for easily adding components from `gluestack-ui` to your projects.

- gluestack-ui offers a powerful and user-friendly Command Line Interface (CLI) for developers.
- Simplifies the development experience and provides a streamlined workflow.
- Includes various commands to assist with installation setup, component management, and updates.
- Some of the commands provided by the gluestack-ui CLI are:
  - Installation setup command: Helps with the initial setup of the gluestack-ui library.
  - Add component command: Allows users to add components from the gluestack-ui library to their projects.
  - Update component command: Helps users update components in their projects to newer versions available in the gluestack-ui library.
  - Remove component command: Enables users to remove components that are no longer needed from their projects.
- These commands help developers efficiently manage their project components and keep them up to date.
- The gluestack-ui CLI aims to enhance the development workflow and improve productivity.

## Usage

To use the gluestack-ui CLI, you can run the following commands:

- **Initialize gluestack-ui -** This command sets up the gluestack-ui library in your project.

```
    npx gluestack-ui@latest init
```

- **Initialize and add components -**: This command initializes gluestack-ui and adds the required components to your project.

```
    npx gluestack-ui@latest
```

- **Add a component -** Replace `<component-name>` with the name of the component you want to add or with special flag `--all` which will add all the components to your project.

```
    npx gluestack-ui@latest add <component-name>
```

- **Update a component -** Replace `<component-name>` with the name of the component you want to update or with special flag `--all` which will update all the components in your project.

```
    npx gluestack-ui@latest update <component-name>
```

- **Remove a component -** Replace `<component-name>` with the name of the component you want to remove or with special flag `--all` which will remove all the components from your project.

```
    npx gluestack-ui@latest update <component-name>
```

- **Get help -** This command provides help and information about using the gluestack-ui CLI.

```
    npx gluestack-ui@latest update <component-name>
```

## Contributing

Contributions are welcome! If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Submit a pull request to the main repository.

Please ensure that your code follows the project's coding conventions.
