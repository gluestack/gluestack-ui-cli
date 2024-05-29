#!/usr/bin/env node

import { EjectScript } from "./eject/script";
import { existsSync } from "fs-extra";
import { join } from "path";
import process from "process";
export type { EjectConfig as Config } from "./eject/script";

async function main() {
  try {
    const command = process.argv[2];

    if (command === "eject") {
      const configPath = join(
        process.cwd(),
        "gluestack-ui-universal.config.js"
      );

      if (!existsSync(configPath)) {
        console.error(
          "Config file not found! Make sure you have gluestack-ui-universal.config.js in your project root directory." +
            "config path: " +
            configPath
        );
        process.exit(1);
      }

      console.info("Config file found! Reading config file...");

      const { config } = require(configPath);

      if (!config) {
        const errorJSON = {
          config: [
            {
              source: "path/to/source",
              target: "path/to/target",
            },
          ],
        };
        throw new Error(
          `Config not found in starter-cli.config.js! Please add\n module.exports = ${JSON.stringify(
            errorJSON,
            null,
            2
          )} \nto your config file.`
        );
      }

      console.info("Config file read successfully! Copying directories...");

      const ejectScript = new EjectScript(config);

      await ejectScript.run();

      console.info("Directories copied successfully!");
    } else if (command === "--help") {
      console.log("Usage: starter-cli eject");
      console.log("Options:");
      console.log("--help  Show help");
      console.log("Commands:");
      console.log("eject Eject universal starter kit");
    }
    // copyDirectoriesFromSourceToTarget(config);
  } catch (err) {
    console.error("Error: ", err);
  }
}

main();
