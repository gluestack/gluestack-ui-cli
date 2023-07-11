
> Important Notes:
>
> 1. You'll need node version >= 18 & < 19
> 2. Please do not use **Yarn** or **PNPM**, we will only use **npm** as a package manager in **Gluestack's v2**

## Install npm dependencies

```bash
# Run this command from your project's root directory
$ npm run install:all;
```

## Access Glue

```bash
# Run this command from your project's root directory
$ node glue
#
# And its output will be something like this:
#
Usage: glue [options] [command]

Gluestack V2 Framework CLI

Options:
  -V, --version                              output the version number
  -h, --help                                 display help for command

Commands:
  add|install <plugin-name> <instance-name>  installs a gluestack plugin, use help for more info on subcommands
  instance:list                              Prints the list of installed plugin instances
  plugin:list                                Prints the list of available plugins
  plugin:init                                Initializes the gluestack app as a plugin
  watch                                      Watches the instances for changes and restarts them
  help [command]                             display help for command
```

## Create Gluestack Project Build

```bash
# Goto project's root directory and run the following command
$ node glue build
```

## Run Gluestack Project Build

```bash
# Goto seal scripts
$ cd .glue/seal/scripts
# Install npm dependencies
$ npm install
# Create scripts build
$ npm run build
# Here's how you can run your web plugin instance in docker
$ node build/index run:service website --platform docker --ports 3000:9000
# Here's how you can run your web plugin instance in local
$ node build/index run:service website --platform local
```

npm run install:all
node glue add @gluestack-v2/glue-plugin-develop develop
node glue add @gluestack-v2/glue-plugin-web web
