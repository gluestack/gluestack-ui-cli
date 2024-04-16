import { Transform } from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);
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
      // Find or create the presets property in module.exports
      const presetsProperty = moduleExports.find(j.Property, {
        key: { name: 'presets' },
      });

      if (presetsProperty.length > 0) {
        // If presets property exists, add the new preset to its value array if it doesn't already exist
        const presetsArray = presetsProperty.get('value');
        const presets = presetsArray.value.elements.map(
          (element) => element.value
        );
        if (!presets.includes('nativewind/babel')) {
          presetsArray.value.elements.push(j.stringLiteral('nativewind/babel'));
        }
      } else {
        // If presets property doesn't exist, create it and add the presets array
        moduleExports
          .get('body')
          .value.push(
            j.property(
              'init',
              j.identifier('presets'),
              j.arrayExpression([j.stringLiteral('nativewind/babel')])
            )
          );
      }
    }
    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
