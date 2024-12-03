// @ts-nocheck
const { fileURLToPath } = require('url');
const { dirname } = require('path');

/**
 * jscodeshift transform to add GlueStack configuration to Next.js config file
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 * @returns {string}
 */
function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Add GlueStack import
  const existingImports = root.find(j.ImportDeclaration);
  const hasGluestackImport = existingImports.some(
    (path) => path.value.source.value === '@gluestack/ui-next-adapter'
  );

  if (!hasGluestackImport) {
    const gluestackImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('withGluestackUI'))],
      j.literal('@gluestack/ui-next-adapter')
    );

    // Add after the last import or at the start if no imports
    if (existingImports.length) {
      existingImports.at(-1).insertAfter(gluestackImport);
    } else {
      root.get().node.program.body.unshift(gluestackImport);
    }
  }

  // Update nextConfig object
  root
    .find(j.VariableDeclarator, {
      id: { name: 'nextConfig' },
    })
    .forEach((path) => {
      path.value.init = j.objectExpression([
        j.property(
          'init',
          j.identifier('transpilePackages'),
          j.arrayExpression([
            j.literal('nativewind'),
            j.literal('react-native-css-interop'),
          ])
        ),
      ]);
    });

  // Wrap default export with withGluestackUI
  root.find(j.ExportDefaultDeclaration).forEach((path) => {
    const originalExport = path.value.declaration;
    path.value.declaration = j.callExpression(j.identifier('withGluestackUI'), [
      originalExport,
    ]);
  });

  return root.toSource({ quote: 'single' });
}

// Set parser options
transformer.parser = {
  parse: (source) =>
    require('@babel/parser').parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    }),
};

module.exports = transformer;
module.exports.parser = 'tsx';
