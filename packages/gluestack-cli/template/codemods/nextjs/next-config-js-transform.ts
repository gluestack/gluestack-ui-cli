import { Transform } from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);

    // Step 1: Check if the import statement for withGluestackUI already exists
    const importExists =
      root
        .find(j.VariableDeclarator, {
          id: {
            type: 'ObjectPattern',
            properties: [
              {
                key: {
                  type: 'Identifier',
                  name: 'withGluestackUI',
                },
              },
            ],
          },
        })
        .filter((path) => {
          return (
            path.parent.node.type === 'VariableDeclaration' &&
            path.parent.node.declarations[0].init.type === 'CallExpression' &&
            path.parent.node.declarations[0].init.callee.name === 'require' &&
            path.parent.node.declarations[0].init.arguments[0].value ===
              '@gluestack/ui-next-adapter'
          );
        })
        .size() > 0;

    if (!importExists) {
      const importStatement = j.template.statement`
        const { withGluestackUI } = require("@gluestack/ui-next-adapter");
      `;

      root
        .find(j.VariableDeclaration, {
          declarations: [{ id: { name: 'nextConfig' } }],
        })
        .insertBefore(importStatement);
    }

    // Step 2: Add transpilePackages to nextConfig
    root
      .find(j.ObjectExpression)
      .filter(
        (path) =>
          path.parent.value.id && path.parent.value.id.name === 'nextConfig'
      )
      .forEach((path) => {
        const properties = path.node.properties;

        // Check if transpilePackages is already present
        const transpilePackages = properties.find(
          (prop) =>
            prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'transpilePackages'
        );

        if (!transpilePackages) {
          const newProperty = j.property(
            'init',
            j.identifier('transpilePackages'),
            j.arrayExpression([
              j.literal('nativewind'),
              j.literal('react-native-css-interop'),
            ])
          );
          properties.push(newProperty);
        }
      });

    // Step 3: Wrap module.exports with withGluestackUI
    root
      .find(j.AssignmentExpression, {
        left: {
          object: { name: 'module' },
          property: { name: 'exports' },
        },
      })
      .replaceWith((path) => {
        return j.assignmentExpression(
          '=',
          j.memberExpression(j.identifier('module'), j.identifier('exports')),
          j.callExpression(j.identifier('withGluestackUI'), [
            j.identifier('nextConfig'),
          ])
        );
      });

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
