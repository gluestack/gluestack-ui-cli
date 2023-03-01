const fs = require("fs-extra");
const prompts = require("prompts");
const path = require("path");
const process = require("process");
const util = require("util");

const {
  cloneComponentRepo,
  createFolders,
  pullComponentRepo,
  checkIfFolderExits,
  installDependencies,
} = require("./utils");
const homeDir = require("os").homedir();
const currDir = process.cwd();
const copyAsync = util.promisify(fs.copy);

const addIndexFile = async (componentsDirectory, level = 0) => {
  fs.readdir(componentsDirectory, (err, files) => {
    if (err) {
      throw err;
    }
    const exports = files
      .filter(
        (file) =>
          file !== "index.js" && file !== "index.tsx" && file !== "index.ts"
      )
      .map((file) => {
        if (level === 0) {
          addIndexFile(componentsDirectory + `/${file}`, level + 1);
        }

        return `export * from './${file.split(".")[0]}';`;
      })
      .join("\n");

    fs.writeFile(path.join(componentsDirectory, "index.ts"), exports, (err) => {
      if (err) {
        throw err;
      }
    });
  });
};

const copyFolders = async (sourcePath, targetPath, specificComponent) => {
  const groupedComponents = {};
  let specificComponentType;
  console.log(sourcePath, targetPath, specificComponent);
  //  Traverse all components
  fs.readdirSync(sourcePath).forEach((component) => {
    if (component !== "index.ts" && component !== "index.tsx") {
      // Read in the existing package.json file
      const packageJsonPath = `${sourcePath}/${component}/config.json`;
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      let componentType;
      if (packageJson.keywords.indexOf("components") !== -1) {
        componentType = packageJson.keywords[1];
      }

      groupedComponents[componentType] = groupedComponents[componentType] || [];
      groupedComponents[componentType].push(component);
      if (component.toLowerCase() === specificComponent.toLowerCase()) {
        specificComponentType = componentType;
      }
    }
  });

  const selectedComponents = {};

  // Ask component type
  if (!specificComponentType) {
    const selectedComponentType = await prompts({
      type: "multiselect",
      name: "componentType",
      message: `Select the type of components:`,
      choices: Object.keys(groupedComponents).map((type) => {
        return { title: type, value: type };
      }),
    });
    if (selectedComponentType.componentType) {
      await Promise.all(
        selectedComponentType.componentType.map(async (component) => {
          if (groupedComponents[component].length !== 0) {
            const selectComponents = await prompts({
              type: "multiselect",
              name: "components",
              message: `Select ${component} components:`,
              choices: groupedComponents[component].map((type) => {
                return { title: type, value: type };
              }),
            });
            selectedComponents[component] = selectComponents.components;
          } else {
            console.log(`No components of ${component} type!`);
          }
        })
      );
    }
  } else {
    selectedComponents[specificComponentType] = [specificComponent];
  }

  await Promise.all(
    Object.keys(selectedComponents).map((component) => {
      createFolders(`${targetPath}/${component}`);
      selectedComponents[component].map((subcomponent) => {
        // Add Packages
        const compPackageJsonPath = `${sourcePath}/${subcomponent}/config.json`;
        const compPackageJson = JSON.parse(
          fs.readFileSync(compPackageJsonPath, "utf8")
        );

        const rootPackageJsonPath = `${currDir}/package.json`;
        const rootPackageJson = JSON.parse(
          fs.readFileSync(rootPackageJsonPath, "utf8")
        );

        rootPackageJson.dependencies = {
          ...rootPackageJson.dependencies,
          ...compPackageJson.dependencies,
        };

        fs.writeFileSync(
          rootPackageJsonPath,
          JSON.stringify(rootPackageJson, null, 2)
        );

        createFolders(`${targetPath}/${component}/${subcomponent}`);
        fs.copy(
          `${sourcePath}/${subcomponent}`,
          `${targetPath}/${component}/${subcomponent}`
        )
          .then(() => {
            fs.unlinkSync(
              `${targetPath}/${component}/${subcomponent}/config.json`
            );
            console.log(
              "\x1b[36m%s\x1b[0m",
              `${subcomponent} is added to your project!`
            );
          })
          .catch((err) => {
            console.error(err);
          });
      });
    })
  );
};

const componentAdder = async (specificComponent = "null") => {
  try {
    // Get config
    const configFile = fs.readFileSync(
      `${currDir}/gluestack-ui.config.ts`,
      "utf-8"
    );

    const match = configFile.match(/componentPath:\s+'([^']+)'/);
    const componentPath = match && match[1];

    await getComponentGitRepo();
    createFolders(path.join(currDir, componentPath));
    const sourcePath = `${homeDir}/.gluestack/cache/gluestack-ui/example/storybook/src/ui-components`;
    const targetPath = path.join(currDir, componentPath);
    await copyFolders(sourcePath, targetPath, specificComponent);
    await installDependencies(currDir);
    await addIndexFile(targetPath);
  } catch (err) {
    console.log(err);
  }
};

const addProvider = async (sourcePath, targetPath) => {
  createFolders(`${targetPath}/core`);
  createFolders(`${targetPath}/core/gluestack-ui-provider`);

  await copyAsync(
    `${sourcePath}/Provider`,
    `${targetPath}/core/gluestack-ui-provider`
  );

  // Copy config
  // const gluestackConfig = fs.readFileSync(
  //   `${targetPath}/core/gluestack-ui-provider/gluestack-ui.config.ts`,
  //   "utf8"
  // );

  const gluestackConfig = fs.readFileSync(
    // `${targetPath}/core/gluestack-ui-provider/gluestack-ui.config.ts`,
    path.resolve(sourcePath, "../", "gluestack-ui.config.ts"),
    "utf8"
  );

  // Write it to root

  await fs.writeFile(`${currDir}/gluestack-ui.config.ts`, gluestackConfig);

  // Delete config.json
  fs.unlinkSync(`${targetPath}/core/gluestack-ui-provider/config.json`);

  // Update Provider Config Path
  const providerIndexFile = fs.readFileSync(
    `${targetPath}/core/gluestack-ui-provider/index.tsx`,
    "utf8"
  );

  let modifiedProviderIndexFile = providerIndexFile.replace(
    "./gluestack-ui.config",
    path
      .relative(
        `${targetPath}/core/gluestack-ui-provider/index.tsx`,
        `${currDir}/gluestack-ui.config`
      )
      .slice(3)
  );

  fs.writeFileSync(
    `${targetPath}/core/gluestack-ui-provider/index.tsx`,
    modifiedProviderIndexFile
  );

  const configFile = fs.readFileSync(
    `${currDir}/gluestack-ui.config.ts`,
    "utf8"
  );

  const folderName = targetPath.split("/").slice(-1)[0];

  const newConfig = configFile.replace(
    /componentPath:\s+'[^']+'/,
    `componentPath: './${folderName}'`
  );

  fs.writeFileSync(`${currDir}/gluestack-ui.config.ts`, newConfig);
};

const getComponentGitRepo = async () => {
  // Clone repo locally in users home directory
  const cloneLocation = homeDir + "/.gluestack/cache";
  const clonedpath = cloneLocation + "/gluestack-ui";
  let clonedRepoExists = await checkIfFolderExits(clonedpath);

  if (clonedRepoExists) {
    await pullComponentRepo(clonedpath);
  } else {
    createFolders(cloneLocation);
    await cloneComponentRepo(
      clonedpath,
      "git@github.com:gluestack/gluestack-ui.git"
    );
  }
};

const initialProviderAdder = async (componentFolderPath) => {
  try {
    await getComponentGitRepo();

    createFolders(`${currDir}/${componentFolderPath}`);
    const sourcePath = `${homeDir}/.gluestack/cache/gluestack-ui/example/storybook/src/ui-components`;
    const targetPath = path.join(currDir, componentFolderPath);
    await addProvider(sourcePath, targetPath);
    await addIndexFile(targetPath);
    const message = `
    Gluestack Provider has been added to your components folder. 
    To use it, simply wrap your app component with the <GluestackUIProvider> component like this:

    export default function App() {
      return (
        <GluestackUIProvider>
          <Component />
        </GluestackUIProvider>
      );
    }
   
    `;

    console.log(message);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { componentAdder, initialProviderAdder };
