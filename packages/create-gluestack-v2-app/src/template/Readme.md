# Gluestack Project

This is a Gluestack project bootstrapped with `create-gluestack-v2-app`.

## Getting Started

Before running the development server, you need to install the `bolt` command because gluestack uses [Bolt](https://bolt.gluestack.io) to run project. If you haven't installed it yet, run the following command:


```bash
npm install -g @gluestack/bolt@latest 
```

For more information about bolt, refer to the official [Bolt documentation](https://bolt.gluestack.io/docs).

Once you have installed `bolt`, you can start the development server by running the following command:


```bash
node glue start
```

Once the development server is up and running, open http://localhost:3000 in your browser to see the result.
You can begin editing the page by modifying `client/web/pages/index.tsx`. The page will auto-update as you edit the file.


### Usage

To install a plugin, use the `node glue add <plugin-package> <instance-name>` command. Replace <plugin-package> with the name of the plugin you want to install.
For example, to install the "web" plugin, run:

```bash
node glue add @gluestack-v2/glue-plugin-service-gateway gateway
```

### Learn More
To learn more about Gluestack, explore the following resources:

- Gluestack Documentation: Visit the official [Gluestack documentation](https://gluestack.io/docs) to learn about its features and API.
- GitHub Repository: You can check out the [Gluestack GitHub repository](https://github.com/gluestack-v2/framework-cli) for the latest updates, issues, and contributions. Your feedback and contributions are welcome!
- Plugin Documentation: If you want to use specific plugins and learn more about their configurations and usage, refer to the plugin documentation section in the [Gluestack documentation](https://gluestack.io/docs). Here you will find details about each available plugin and how to integrate them into your Gluestack project.

### Deploy
For deployment instructions and more details, please refer to our [Gluestack deployment documentation](https://gluestack.io).

