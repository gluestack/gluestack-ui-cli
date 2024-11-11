import {
  Collection,
  ImportDeclaration,
  Transform,
  VariableDeclaration,
} from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = file.path.includes('.ts')
      ? api.jscodeshift.withParser('ts')
      : api.jscodeshift;
    const root = j(file.source);

    const importStatement: ImportDeclaration = j.importDeclaration(
      [
        j.importSpecifier(
          j.identifier('withGluestackUI'),
          j.identifier('withGluestackUI')
        ),
      ],
      j.literal('@gluestack/ui-next-adapter')
    );

    // Check if import statement already exists
    const existingImport = root.find(j.ImportDeclaration, {
      source: { value: '@gluestack/ui-next-adapter' },
    });
    if (existingImport.length === 0) {
      // Add import statement at the beginning of the file
      root.get().node.program.body.unshift(importStatement);
    }

    // Find the nextConfig object
    const nextConfigObject = root.find(j.VariableDeclaration, {
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { name: 'nextConfig' },
        },
      ],
    }) as Collection<VariableDeclaration>;

    if (nextConfigObject.length > 0) {
      // Check if transpilePackages already exist
      const init = nextConfigObject.get('0').node.declarations[0].init;
      if (init && init.type === 'ObjectExpression') {
        const transpilePackages = init.properties.find(
          (prop) =>
            prop.type === 'Property' && prop.key.name === 'transpilePackages'
        );
        if (!transpilePackages) {
          // Modify the nextConfig object to add transpilePackages
          const transpilePackagesProperty = j.property(
            'init',
            j.identifier('transpilePackages'),
            j.arrayExpression([
              j.literal('nativewind'),
              j.literal('react-native-css-interop'),
            ])
          );
          init.properties.push(transpilePackagesProperty);
        }
      }
    }

    // Find and replace the existing export default statement
    const existingExportDefault = root.find(j.ExportDefaultDeclaration);
    if (existingExportDefault.length > 0) {
      const newExportDefault = j.exportDefaultDeclaration(
        j.callExpression(j.identifier('withGluestackUI'), [
          j.identifier('nextConfig'),
        ])
      );
      existingExportDefault.replaceWith(newExportDefault);
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
