import { Transform } from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);
    // Check if withNativeWind import already exists
    const withNativeWindImportExists =
      root.find(j.VariableDeclaration, {
        declarations: [
          {
            type: 'VariableDeclarator',
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
          },
        ],
      }).length > 0;

    if (!withNativeWindImportExists) {
      const withNativeWindImport = `const {withNativeWind} = require('nativewind/metro');`;
      root.get().node.program.body.unshift(withNativeWindImport);
    }

    // Check if config variable and mergeConfig already exist
    let configVariableDeclaration = root.find(j.VariableDeclaration, {
      declarations: [
        {
          id: { name: 'config' },
          init: { type: 'ObjectExpression' },
        },
      ],
    });
    let mergeConfigCallExists = false;

    if (configVariableDeclaration.length) {
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

    // Check if mergeConfig with withNativeWind already exists
    let mergeConfigCall = root
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

    let withNativeWindCallExists = false;

    if (mergeConfigCall.length) {
      withNativeWindCallExists =
        mergeConfigCall.find(j.CallExpression, {
          callee: {
            name: 'withNativeWind',
          },
        }).length > 0;
    }

    if (!withNativeWindCallExists) {
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
