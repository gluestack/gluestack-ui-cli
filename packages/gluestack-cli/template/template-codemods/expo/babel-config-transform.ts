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

        if (!presetsProperty) {
          // Presets property doesn't exist, create it
          returnObject.properties.push(
            j.objectProperty(
              j.identifier('presets'),
              j.arrayExpression([
                j.arrayExpression([
                  j.stringLiteral('babel-preset-expo'),
                  j.objectExpression([
                    j.objectProperty(
                      j.identifier('jsxImportSource'),
                      j.stringLiteral('nativewind')
                    ),
                  ]),
                ]),
                j.stringLiteral('nativewind/babel'),
              ])
            )
          );
        } else {
          // Check if nativewind presets already exist
          const presetsArray = presetsProperty.value as any;

          const nativewindPresetExists =
            presetsArray &&
            presetsArray.elements.some((element: any) => {
              if (
                element.type === 'ArrayExpression' &&
                element.elements.length >= 2
              ) {
                const [presetNameNode, configNode] = element.elements;
                const presetName = presetNameNode.value;
                const config =
                  configNode.type === 'ObjectExpression'
                    ? configNode.properties
                    : [];

                return (
                  presetName === 'babel-preset-expo' &&
                  config.some(
                    (prop: any) =>
                      prop.key.type === 'Identifier' &&
                      prop.key.name === 'jsxImportSource' &&
                      prop.value.value === 'nativewind'
                  )
                );
              }
              return false;
            });
          if (!nativewindPresetExists) {
            // Presets property already exists, append to it
            if (presetsProperty.value.type === 'ArrayExpression') {
              const subArr: any[] = [];

              // Extract existing properties in presets array
              presetsProperty.value.elements.forEach((element: any) => {
                if (
                  element.type === 'ArrayExpression' &&
                  Array.isArray(element.elements) && // Ensure elements is an array
                  element.elements.length >= 1
                ) {
                  subArr.push(element);
                }
              });

              // Append { jsxImportSource } to subArr
              subArr.push(
                j.arrayExpression([
                  j.stringLiteral('babel-preset-expo'),
                  j.objectExpression([
                    j.objectProperty(
                      j.identifier('jsxImportSource'),
                      j.stringLiteral('nativewind')
                    ),
                  ]),
                ])
              );

              // Create a new array to assign to presets and add 'nativewind/babel'
              const newPresetsArray = j.arrayExpression([
                ...subArr,
                j.stringLiteral('nativewind/babel'),
              ]);

              // Update presetsProperty value
              presetsProperty.value = newPresetsArray;
            }
          }
        }
      }
    });
    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
