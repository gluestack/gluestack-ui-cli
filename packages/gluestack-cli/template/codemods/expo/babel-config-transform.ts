import {
  Transform,
  ReturnStatement,
  ObjectExpression,
  Property,
} from 'jscodeshift';

const transform: Transform = (file, api, options): string => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);
    const isSDK50 = options.isSDK50;
    const tailwindConfig = options.tailwindConfig;

    root.find<ReturnStatement>(j.ReturnStatement).forEach((path) => {
      const returnObject = path.node.argument as ObjectExpression | null;

      if (returnObject && returnObject.type === 'ObjectExpression') {
        let presetsProperty = returnObject.properties.find(
          (property) =>
            property.type === 'Property' &&
            (property.key as any).name === 'presets'
        ) as Property | undefined;

        let pluginsProperty = returnObject.properties.find(
          (property) =>
            property.type === 'Property' &&
            (property.key as any).name === 'plugins'
        ) as Property | undefined;

        // presets code modification
        const nativewindPreset = j.arrayExpression([
          j.stringLiteral('babel-preset-expo'),
          j.objectExpression([
            j.objectProperty(
              j.identifier('jsxImportSource'),
              j.stringLiteral('nativewind')
            ),
          ]),
        ]);

        const nativewindBabel = j.stringLiteral('nativewind/babel');

        if (!presetsProperty) {
          returnObject.properties.push(
            j.objectProperty(
              j.identifier('presets'),
              j.arrayExpression([nativewindPreset, nativewindBabel])
            )
          );
        } else {
          const presetsArray = presetsProperty.value as any;

          // Check if 'babel-preset-expo' exists as a string in the presets array
          const babelPresetIndex = presetsArray.elements.findIndex(
            (element: any) => element.value === 'babel-preset-expo'
          );

          if (babelPresetIndex !== -1) {
            // Replace the string 'babel-preset-expo' with nativewindPreset
            presetsArray.elements[babelPresetIndex] = nativewindPreset;
          }

          // Check if 'nativewind/babel' is already in the presets array
          const nativewindBabelExists = presetsArray.elements.some(
            (element: any) =>
              element.type === 'StringLiteral' &&
              element.value === 'nativewind/babel'
          );

          // Add 'nativewind/babel' to presets array if it's not already present
          if (!nativewindBabelExists) {
            presetsArray.elements.push(nativewindBabel);
          }
        }

        // fetch tailwind config filenName from resolved path of tailwind.config.js
        const parts = tailwindConfig.split(/[/\\]/);
        const tailwindConfigFileName = parts[parts.length - 1];

        //plugin code modification
        const moduleResolverPlugin = j.arrayExpression([
          j.stringLiteral('module-resolver'),
          j.objectExpression([
            j.objectProperty(
              j.identifier('root'),
              j.arrayExpression([j.stringLiteral('./')])
            ),
            j.objectProperty(
              j.identifier('alias'),
              j.objectExpression([
                j.objectProperty(j.stringLiteral('@'), j.stringLiteral('./')),
                j.objectProperty(
                  j.stringLiteral('tailwind.config'),
                  j.stringLiteral(`./` + tailwindConfigFileName)
                ),
              ])
            ),
          ]),
        ]);

        // const expoRouterBabel = j.stringLiteral('expo-router/babel');
        const reactNativeReanimatedPlugin = j.stringLiteral(
          'react-native-reanimated/plugin'
        );

        if (!pluginsProperty) {
          isSDK50
            ? returnObject.properties.push(
                j.objectProperty(
                  j.identifier('plugins'),
                  j.arrayExpression([moduleResolverPlugin])
                )
              )
            : returnObject.properties.push(
                j.objectProperty(
                  j.identifier('plugins'),
                  j.arrayExpression([
                    moduleResolverPlugin,
                    reactNativeReanimatedPlugin,
                  ])
                )
              );
        } else {
          const pluginsArray = pluginsProperty.value as any;
          const pluginElements = pluginsArray.elements;

          // Check for module-resolver
          if (
            !pluginElements.some(
              (element: any) =>
                element.type === 'ArrayExpression' &&
                element.elements[0].value === 'module-resolver'
            )
          ) {
            pluginElements.push(moduleResolverPlugin);
          }

          // Check for expo-router/babel
          // if (
          //   !pluginElements.some(
          //     (element: any) =>
          //       element.type === 'StringLiteral' &&
          //       element.value === 'expo-router/babel'
          //   ) &&
          //   !isSDK50
          // ) {
          //   pluginElements.push(expoRouterBabel);
          // }

          // Check for react-native-reanimated/plugin
          if (
            !pluginElements.some(
              (element: any) =>
                element.type === 'StringLiteral' &&
                element.value === 'react-native-reanimated/plugin'
            ) &&
            !isSDK50
          ) {
            pluginElements.push(reactNativeReanimatedPlugin);
          }
        }
      }
    });

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return file.source;
  }
};

export default transform;
