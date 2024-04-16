import { Transform, FileInfo, API, ExpressionStatement } from 'jscodeshift';

const transform: Transform = (file: FileInfo, api: API) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);

    // Find the module.exports function
    const moduleExportsFunction = root.find<ExpressionStatement>(
      j.ExpressionStatement,
      {
        expression: {
          type: 'AssignmentExpression',
          left: {
            type: 'MemberExpression',
            object: { name: 'module' },
            property: { name: 'exports' },
          },
          right: { type: 'FunctionExpression' },
        },
      }
    );

    // Update the presets array
    moduleExportsFunction.find(j.ReturnStatement).forEach((returnStatement) => {
      const returnObject = returnStatement.node.argument;
      if (returnObject && returnObject.type === 'ObjectExpression') {
        let presetsProperty: any = null;

        // Find existing presets property
        returnObject.properties.forEach((property) => {
          if (
            property.type === 'Property' &&
            property.key.type === 'Identifier' &&
            property.key.name === 'presets'
          ) {
            presetsProperty = property;
          }
        });

        if (presetsProperty) {
          // Presets property already exists, append to it
          if (presetsProperty.value.type === 'ArrayExpression') {
            const presetsArray = presetsProperty.value;

            const nativewindPreset = j.objectExpression([
              j.objectProperty(
                j.identifier('jsxImportSource'),
                j.stringLiteral('nativewind')
              ),
            ]);
            presetsArray.elements.push(nativewindPreset);
            presetsArray.elements.push(j.stringLiteral('nativewind/babel'));
          }
        } else {
          // Presets property doesn't exist, create it
          returnObject.properties.push(
            j.objectProperty(
              j.identifier('presets'),
              j.arrayExpression([
                j.stringLiteral('babel-preset-expo'),
                j.objectExpression([
                  j.objectProperty(
                    j.identifier('jsxImportSource'),
                    j.stringLiteral('nativewind')
                  ),
                ]),
                j.stringLiteral('nativewind/babel'),
              ])
            )
          );
        }
      }
    });
    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
