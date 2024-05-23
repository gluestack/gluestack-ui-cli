import { Transform } from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);
    // Check if withNativeWind import already exists
    const withNativeWindImportExists =
      root.find(j.VariableDeclarator, {
        id: {
          type: 'ObjectPattern',
          properties: [
            {
              type: 'Property',
              key: { name: 'withNativeWind' },
            },
          ],
        },
        init: {
          type: 'CallExpression',
          callee: { name: 'require' },
          arguments: [{ type: 'Literal', value: 'nativewind/metro' }],
        },
      }).length > 0;

    if (!withNativeWindImportExists) {
      const withNativeWindImport = `const {withNativeWind} = require('nativewind/metro');`;
      root.get().node.program.body.unshift(withNativeWindImport);
    }

    // Find the assignment to config variable
    const configAssignment = root.find(j.AssignmentExpression, {
      right: { name: 'config' },
    });

    // Add the withNativeWind function call
    if (configAssignment.length) {
      configAssignment.replaceWith((nodePath) => {
        const configNode = nodePath.node;
        const withNativeWindCall = j.callExpression(
          j.identifier('withNativeWind'),
          [
            configNode.right,
            j.objectExpression([
              j.property(
                'init',
                j.identifier('input'),
                j.literal('./global.css')
              ),
            ]),
          ]
        );
        configNode.right = withNativeWindCall;
        return configNode;
      });
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
