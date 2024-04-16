import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);
    // Add the withNativeWind import if it doesn't already exist
    const withNativeWindImport = `const {withNativeWind} = require('nativewind/metro');`;
    root.get().node.program.body.unshift(withNativeWindImport);

    // Find the existing config variable declaration
    const configVariableDeclaration = root.find(j.VariableDeclaration, {
      declarations: [
        {
          id: { name: 'config' },
          init: { type: 'ObjectExpression' },
        },
      ],
    });

    // update it with mergeConfig
    if (configVariableDeclaration.length) {
      // Find the mergeConfig call expression
      const configValue = configVariableDeclaration.get(
        'declarations',
        0,
        'init'
      ).value;
      const mergeConfigCall = root
        .find(j.CallExpression, {
          callee: {
            name: 'mergeConfig',
          },
        })
        .at(0);
      if (mergeConfigCall.length) {
        configVariableDeclaration.get().node.declarations[0].init =
          mergeConfigCall.get().node;
        //add config properties
        mergeConfigCall.get('arguments', 1).replace(configValue);
      }
    }
    // find module.exports assignments
    const mergeConfigCall = root
      .find(j.AssignmentExpression, {
        left: {
          type: 'MemberExpression',
          object: { name: 'module' },
          property: { name: 'exports' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'mergeConfig',
          },
        },
      })
      .find(j.CallExpression, {
        callee: {
          type: 'Identifier',
          name: 'mergeConfig',
        },
      });

    // update it with withNativeWind
    if (mergeConfigCall.length) {
      mergeConfigCall.replaceWith((nodePath) => {
        let mergeConfigNode = nodePath.node;
        const withNativeWindCall = j.callExpression(
          j.identifier('withNativeWind'),
          [
            j.identifier('config'),
            j.objectExpression([
              j.property(
                'init',
                j.identifier('input'),
                j.literal('./global.css')
              ),
            ]),
          ]
        );
        mergeConfigNode = withNativeWindCall;
        return mergeConfigNode;
      });
    }
    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
