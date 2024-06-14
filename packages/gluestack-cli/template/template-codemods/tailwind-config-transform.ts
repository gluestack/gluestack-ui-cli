import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);
    // Find the tailwind.config.js file
    const tailwindConfig = root.find(j.AssignmentExpression, {
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'module',
        },
        property: {
          type: 'Identifier',
          name: 'exports',
        },
      },
      right: {
        type: 'ObjectExpression',
      },
    });
    if (!tailwindConfig.length) {
      return file.source; // No changes, return original content
    }
    // Find the 'content' property
    const contentProperty = tailwindConfig.find(j.Property, {
      key: { name: 'content' },
    });
    if (contentProperty.length) {
      const contentValueNode = contentProperty.get('value');
      const newPaths = options.paths || [];
      contentValueNode.value.elements = newPaths.map((path) =>
        j.stringLiteral(path)
      );
    }
    const importantProperty = tailwindConfig.find(j.Property, {
      key: { name: 'important' },
    });

    // if important: true roperty not found, create it
    if (!importantProperty.size()) {
      // Find the 'presets' property index
      let presetsIndex = -1;
      const properties = tailwindConfig.get(0).node.right.properties;

      properties.forEach((property, index) => {
        if (property.key.name === 'presets') {
          presetsIndex = index;
        }
      });

      if (presetsIndex !== -1) {
        // Create the important property node
        const importantPropertyNode = j.property(
          'init',
          j.identifier('important'),
          j.literal(true)
        );

        // Insert the important property node after presets
        properties.splice(presetsIndex + 1, 0, importantPropertyNode);
      }
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
