import { Transform } from 'jscodeshift';
import fs from 'fs-extra';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);

    // Read the options from the file (passed via --optionsFile)
    const optionsFile = options.optionsFile;
    let externalOptions = { paths: [], projectType: '' };

    if (optionsFile && fs.existsSync(optionsFile)) {
      const fileContent = fs.readFileSync(optionsFile, 'utf-8');
      externalOptions = JSON.parse(fileContent);
    }

    const { paths: newPaths } = externalOptions;

    // Ensure options.paths is an array
    const pathsArray = Array.isArray(newPaths) ? newPaths : [];

    // Find the tailwind.config.js or tailwind.config.ts file
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
    let contentProperty = tailwindConfig.find(j.Property, {
      key: { name: 'content' },
    });

    if (!contentProperty.length) {
      // If the content property doesn't exist, create it
      const properties = tailwindConfig.get(0).node.right.properties;
      const contentPropertyNode = j.property(
        'init',
        j.identifier('content'),
        j.arrayExpression([]) // Start with an empty array
      );
      properties.push(contentPropertyNode);

      // Refetch the content property after adding it
      contentProperty = tailwindConfig.find(j.Property, {
        key: { name: 'content' },
      });
    }

    const contentValueNode = contentProperty.get('value');
    if (contentValueNode.value.type === 'ArrayExpression') {
      // Replace the existing elements with the new paths
      contentValueNode.value.elements = pathsArray.map((path: string) =>
        j.stringLiteral(path.replace(/\\/g, '/'))
      );
    }

    //  handling important property
    const importantProperty = tailwindConfig.find(j.Property, {
      key: { name: 'important' },
    });

    // if important: true roperty not found, create it
    if (!importantProperty.size() && options.projectType === 'nextjs') {
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
          j.literal('html')
        );

        // Insert the important property node after presets
        properties.splice(presetsIndex + 1, 0, importantPropertyNode);
      }
    }

    // Find and modify the 'darkMode' property
    const darkModeProperty = tailwindConfig.find(j.Property, {
      key: { name: 'darkMode' },
    });

    const project = options.projectType;
    const newDarkModeValue = project === 'nextjs' ? 'class' : 'media';

    if (darkModeProperty.length) {
      darkModeProperty.get(0).node.value = j.stringLiteral(newDarkModeValue);
    } else {
      // If darkMode property doesn't exist, add it
      const properties = tailwindConfig.get(0).node.right.properties;
      const darkModePropertyNode = j.property(
        'init',
        j.identifier('darkMode'),
        j.stringLiteral(newDarkModeValue)
      );
      properties.push(darkModePropertyNode);
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
