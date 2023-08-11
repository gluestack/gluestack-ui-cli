# gluestack Project

This is a gluestack project bootstrapped with `create-gluestack-v2-app`.

## Getting Started

Before running the development server, you need to install the `bolt` command because gluestack uses [bolt](https://bolt.gluestack.io) to run project. If you haven't installed it yet, run the following command:
```bash
npm install -g @gluestack/bolt@latest 
```
For more information about `bolt`, refer to the official [bolt documentation](https://bolt.gluestack.io/docs).


Once you have installed `bolt`, you can start the development server by running the following command:

```bash
node glue start
```

Once the development server is up and running, open http://localhost:3000 in your browser to see the result.
You can begin editing the page by modifying `client/web/pages/index.tsx`. The page will auto-update as you edit the file.


## Usage

To install a plugin, use the `node glue add <plugin-package> <instance-name>` command. Replace <plugin-package> with the name of the plugin you want to install.
For example, to install the `gateway` plugin, run:

```bash
node glue add @gluestack-v2/glue-plugin-service-gateway gateway
```

## Learn More

To learn more about gluestack, explore the following resources:
- **Official Documentation:** Visit the official [gluestack documentation](https://gluestack.io/docs) to learn about its features and API.
- **GitHub Repository:** You can check out the [gluestack GitHub repository](https://github.com/gluestack-v2/framework-cli) for the latest updates, issues, and contributions. Your feedback and contributions are welcome!
- **Plugin Documentation:** If you want to use specific plugins and learn more about their configurations and usage, refer to the plugin documentation section in the [gluestack documentation](https://gluestack.io/docs). Here you will find details about each available plugin and how to integrate them into your gluestack project.

## Deploy

For deployment instructions and more details, please refer to our [gluestack deployment documentation](https://gluestack.io).

