import { resolve } from "path";
import { copyDirectoryFromSourceToTarget } from "./utils";
import { writeFile, copy } from "fs-extra";

export interface EjectConfig {
  screens: string;
  components: string;
  project?: "expo" | "next" | "all";
}

const currDir = process.cwd();

export class EjectScript {
  config: EjectConfig;

  constructor(config: EjectConfig) {
    this.config = config;
  }

  async copyProject(projectName: string) {
    try {
      // Copy project from source to target
      console.log(`Copying ${projectName} project...`);

      await copy(`./apps/${projectName}`, `../${projectName}`, {
        filter: (src) => {
          return (
            !src.includes("node_modules") &&
            !src.includes(".git") &&
            !src.includes(".next") &&
            !src.includes(".expo") &&
            !src.includes(".idea") &&
            !src.includes(".DS_Store")
          );
        },
      });
    } catch (err) {
      console.error(`Error while copying ${projectName} project`, err);
    }
  }

  async copyPackageJSON(projectName: string, packageJSONPath: string) {
    try {
      console.log(`Copying package.json in ${projectName}...`, packageJSONPath);
      let useProjectPackageJSON = require(resolve(
        currDir,
        `../${projectName}/package.json`
      ));
      const currentProjectPackageJSON = require(packageJSONPath);

      if (!currentProjectPackageJSON) {
        console.log("No package.json found in source directory!");
        return;
      }

      useProjectPackageJSON.dependencies = {
        ...currentProjectPackageJSON.dependencies,
        ...useProjectPackageJSON.dependencies,
      };

      useProjectPackageJSON.devDependencies = {
        ...currentProjectPackageJSON.devDependencies,
        ...useProjectPackageJSON.devDependencies,
      };

      delete useProjectPackageJSON.dependencies["@/components"];
      delete useProjectPackageJSON.dependencies["@/screens"];

      await writeFile(
        resolve(currDir, `../${projectName}/package.json`),
        JSON.stringify(useProjectPackageJSON, null, 2)
      );
    } catch (err) {
      console.error("Error while copying package.json", err);
    }
  }

  async copyComponents(projectName: string) {
    try {
      // Copy components from source to target
      console.log("Copying ui components...");

      await copyDirectoryFromSourceToTarget({
        sourceDirectory: this.config.components + "/ui",
        copyDestination: `../${projectName}/components/ui`,
      });

      console.log("Copying custom components...");

      await copyDirectoryFromSourceToTarget({
        sourceDirectory: this.config.components + "/custom",
        copyDestination: `../${projectName}/components/custom`,
      });

      const packageJSONPath = resolve(
        currDir,
        `${this.config.components}/package.json`
      );

      await this.copyPackageJSON(projectName, packageJSONPath);
    } catch (err) {
      console.error("Error while copying components", err);
    }
  }

  async copyScreens(projectName: string) {
    try {
      await copyDirectoryFromSourceToTarget({
        sourceDirectory: this.config.screens,
        copyDestination: `../${projectName}/screens`,
      });

      const packageJSONPath = resolve(
        currDir,
        `${this.config.screens}/package.json`
      );

      await this.copyPackageJSON(projectName, packageJSONPath);
    } catch (err) {
      console.error("Error while copying screens", err);
    }
  }

  async updateTsConfig(projectName: string) {
    try {
      // Update tsconfig.json
      const tsConfigPath = resolve(currDir, `../${projectName}/tsconfig.json`);
      const tsConfig = require(tsConfigPath);

      if (!tsConfig.compilerOptions) {
        tsConfig.compilerOptions = {};
      }

      if (!tsConfig.compilerOptions.paths) {
        tsConfig.compilerOptions.paths = {};
      }

      if (!tsConfig.compilerOptions.paths["@/*"]) {
        tsConfig.compilerOptions.paths["@/*"] = ["./*"];
      }

      tsConfig.compilerOptions.paths = {
        ...tsConfig.compilerOptions.paths,
      };

      await writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    } catch (err) {
      console.error("Error while updating tsconfig.json", err);
    }
  }

  async updateTailwindConfig(projectName: string) {
    try {
      // Update tailwind.config.js
      const tailwindConfigPath = resolve(
        currDir,
        `../${projectName}/tailwind.config.js`
      );

      let tailwindConfig = require(tailwindConfigPath);

      if (!tailwindConfig) {
        console.log("No tailwind.config.js found in source directory!");
        return;
      }

      tailwindConfig.content.push(
        "./components/**/*.{js,jsx,ts,tsx}",
        "./screens/**/*.{js,jsx,ts,tsx}"
      );

      tailwindConfig.content = tailwindConfig.content.filter(
        (item: string) =>
          item !== "../../packages/components/**/*.{js,jsx,ts,tsx}" &&
          item !== "../../packages/screens/**/*.{js,jsx,ts,tsx}"
      );

      await writeFile(
        tailwindConfigPath,
        `/** @type {import('tailwindcss').Config} */
        module.exports = ${JSON.stringify(tailwindConfig, null, 2)}`
      );
    } catch (err) {
      console.error("Error while updating tailwind.config.js", err);
    }
  }

  async eject(projectName: string) {
    try {
      console.log("Running eject script...");
      await this.copyComponents(projectName);
      console.log("Components copied successfully!");

      console.log("Copying screens...");
      await this.copyScreens(projectName);
      console.log("Screens copied successfully!");

      console.log("Updating tsconfig.json...");
      await this.updateTsConfig(projectName);
      console.log("tsconfig.json updated successfully!");

      console.log("Updating tailwind.config.js...");
      await this.updateTailwindConfig(projectName);
      console.log("tailwind.config.js updated successfully!");
    } catch (err) {
      console.error("Error while running eject script", err);
    }
  }

  async run() {
    try {
      const projectName = this.config.project;
      if (projectName && projectName !== "all") {
        console.log("Copying project...");
        await this.copyProject(projectName);
        await this.eject(projectName);
      } else {
        console.log("Copying next project...");
        await this.copyProject("next");
        await this.eject("next");
        console.log("Copying expo project...");
        await this.copyProject("expo-app");
        await this.eject("expo-app");
      }
    } catch (err) {
      console.error("Error while running eject script", err);
    }
  }
}
