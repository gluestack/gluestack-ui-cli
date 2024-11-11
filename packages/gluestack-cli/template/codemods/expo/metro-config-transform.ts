import { writeFileSync } from 'fs-extra';
import { Transform } from 'jscodeshift';
import { parse, print } from 'recast';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift;
    const source = file.source.trim();
    const cssPath = options.cssPath;
    const isSDK50 = options.isSDK50;
    if (source.length === 0) {
      const metroConfigContent = isSDK50
        ? `const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
  
const config = getDefaultConfig(__dirname);
  
module.exports = withNativeWind(config, { input: '${cssPath}' });`
        : `const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
  
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });
  
module.exports = withNativeWind(config, { input: '${cssPath}' });`;
      // Use recast to parse the content
      const ast = parse(metroConfigContent);
      // Print the AST back to code
      const output = print(ast).code;
      writeFileSync(file.path, output, 'utf8');
      return null; // Return early after writing the file
    }
    const root = j(source);

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
      const withNativeWindImport = j.variableDeclaration('const', [
        j.variableDeclarator(
          j.objectPattern([
            j.property(
              'init',
              j.identifier('withNativeWind'),
              j.identifier('withNativeWind')
            ),
          ]),
          j.callExpression(j.identifier('require'), [
            j.literal('nativewind/metro'),
          ])
        ),
      ]);
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
              j.property('init', j.identifier('input'), j.literal(cssPath)),
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
