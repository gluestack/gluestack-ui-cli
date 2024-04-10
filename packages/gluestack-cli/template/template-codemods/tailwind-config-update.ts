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

    // Check if tailwind.config.js has been found
    if (!tailwindConfig.length) {
      return file.source; // No changes, return original content
    }

    // Find the 'content' property
    const contentProperty = tailwindConfig.find(j.Property, {
      key: { name: 'content' },
    });

    // If 'content' property is found, update its value
    if (contentProperty.length) {
      const contentValueNode = contentProperty.get(0).value.value;
      const newPaths = options.newPaths || [];
      const newContentValue = contentValueNode.elements.concat(
        newPaths.map(j.literal)
      );
      contentProperty.get(0).value.value = newContentValue;
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
