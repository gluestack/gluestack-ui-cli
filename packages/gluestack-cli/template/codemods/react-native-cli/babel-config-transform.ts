import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);
    const tailwindConfig = options.tailwindConfigPath;

    // fetch tailwind config filenName from resolved path of tailwind.config.js
    const parts = tailwindConfig.split(/[/\\]/);
    const tailwindConfigFileName = parts[parts.length - 1];

    // Find the module.exports assignment
    const moduleExports = root.find(j.AssignmentExpression, {
      left: {
        object: { name: 'module' },
        property: { name: 'exports' },
      },
      right: {
        type: 'ObjectExpression',
      },
    });

    if (moduleExports.length > 0) {
      const exportObject = moduleExports.get('right');

      // Update or create presets property
      let presetsProperty = exportObject.node.properties.find(
        (prop) => prop.type === 'Property' && prop.key.name === 'presets'
      );

      if (!presetsProperty) {
        presetsProperty = j.property(
          'init',
          j.identifier('presets'),
          j.arrayExpression([])
        );
        exportObject.node.properties.push(presetsProperty);
      }

      const presetsArray = presetsProperty.value.elements;
      const reactNativePreset = j.stringLiteral(
        'module:@react-native/babel-preset'
      );
      const nativewindPreset = j.stringLiteral('nativewind/babel');

      // Add react-native preset if not present
      if (!presetsArray.some((el) => el.value === reactNativePreset.value)) {
        presetsArray.unshift(reactNativePreset);
      }

      // Add nativewind preset if not present
      if (!presetsArray.some((el) => el.value === nativewindPreset.value)) {
        presetsArray.push(nativewindPreset);
      }

      // Add or update plugins property
      let pluginsProperty = exportObject.node.properties.find(
        (prop) => prop.type === 'Property' && prop.key.name === 'plugins'
      );

      if (!pluginsProperty) {
        pluginsProperty = j.property(
          'init',
          j.identifier('plugins'),
          j.arrayExpression([])
        );
        exportObject.node.properties.push(pluginsProperty);
      }

      const pluginsArray = pluginsProperty.value.elements;

      // Check if module-resolver plugin exists
      const moduleResolverIndex = pluginsArray.findIndex(
        (el) =>
          el.type === 'ArrayExpression' &&
          el.elements[0].value === 'module-resolver'
      );

      if (moduleResolverIndex === -1) {
        // If module-resolver doesn't exist, add it
        const moduleResolverPlugin = j.arrayExpression([
          j.stringLiteral('module-resolver'),
          j.objectExpression([
            j.property(
              'init',
              j.identifier('root'),
              j.arrayExpression([j.stringLiteral('./')])
            ),
            j.property(
              'init',
              j.identifier('extensions'),
              j.arrayExpression([
                j.stringLiteral('.js'),
                j.stringLiteral('.ts'),
                j.stringLiteral('.tsx'),
                j.stringLiteral('.jsx'),
              ])
            ),
            j.property(
              'init',
              j.identifier('alias'),
              j.objectExpression([
                j.property('init', j.stringLiteral('@'), j.stringLiteral('./')),
                j.property(
                  'init',
                  j.stringLiteral('tailwind.config'),
                  j.stringLiteral('./' + tailwindConfigFileName)
                ),
              ])
            ),
          ]),
        ]);
        pluginsArray.push(moduleResolverPlugin);
      } else {
        // If module-resolver exists, update it cautiously
        const moduleResolverConfig =
          pluginsArray[moduleResolverIndex].elements[1];

        // Ensure root property exists and includes './'
        let rootProp = moduleResolverConfig.properties.find(
          (p) => p.key.name === 'root'
        );
        if (!rootProp) {
          rootProp = j.property(
            'init',
            j.identifier('root'),
            j.arrayExpression([j.stringLiteral('./')])
          );
          moduleResolverConfig.properties.push(rootProp);
        } else if (
          rootProp.value.type === 'ArrayExpression' &&
          !rootProp.value.elements.some((e) => e.value === './')
        ) {
          rootProp.value.elements.push(j.stringLiteral('./'));
        }

        // Ensure extensions property exists and includes all required extensions
        let extensionsProp = moduleResolverConfig.properties.find(
          (p) => p.key.name === 'extensions'
        );
        const requiredExtensions = ['.js', '.ts', '.tsx', '.jsx'];
        if (!extensionsProp) {
          extensionsProp = j.property(
            'init',
            j.identifier('extensions'),
            j.arrayExpression(requiredExtensions.map((e) => j.stringLiteral(e)))
          );
          moduleResolverConfig.properties.push(extensionsProp);
        } else if (extensionsProp.value.type === 'ArrayExpression') {
          requiredExtensions.forEach((ext) => {
            if (!extensionsProp.value.elements.some((e) => e.value === ext)) {
              extensionsProp.value.elements.push(j.stringLiteral(ext));
            }
          });
        }

        // Ensure alias property exists and includes '@' alias
        let aliasProp = moduleResolverConfig.properties.find(
          (p) => p.key.name === 'alias'
        );
        if (!aliasProp) {
          aliasProp = j.property(
            'init',
            j.identifier('alias'),
            j.objectExpression([
              j.property('init', j.stringLiteral('@'), j.stringLiteral('./')),
              j.property(
                'init',
                j.stringLiteral('tailwind.config'),
                j.stringLiteral('./' + tailwindConfigFileName)
              ),
            ])
          );
          moduleResolverConfig.properties.push(aliasProp);
        } else if (
          aliasProp.value.type === 'ObjectExpression' &&
          !aliasProp.value.properties.some((p) => p.key.value === '@')
        ) {
          aliasProp.value.properties.push(
            j.property('init', j.stringLiteral('@'), j.stringLiteral('./'))
          );
        } else if (
          aliasProp.value.type === 'ObjectExpression' &&
          !aliasProp.value.properties.some(
            (p) => p.key.value === 'tailwind.config'
          )
        ) {
          aliasProp.value.properties.push(
            j.property(
              'init',
              j.stringLiteral('tailwind.config'),
              j.stringLiteral('./' + tailwindConfigFileName)
            )
          );
        }
      }
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
