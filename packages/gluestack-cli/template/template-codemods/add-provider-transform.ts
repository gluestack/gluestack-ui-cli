import { Transform } from 'jscodeshift';

const transform: Transform = (fileInfo, api) => {
  try {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    if (root.find(j.JSXElement).length > 0) {
      // Import statement for GUIProvider
      const guiProviderImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('GluestackUIProvider'))],
        j.literal(`@/components/ui/GluestackUIProvider`)
      );
      // Insert import statement at the beginning of the file
      root.get().node.program.body.unshift(guiProviderImport);

      // Find JSX elements in the file
      const jsxElements = root.findJSXElements('*');
      // Wrap each JSX element with <GUIProvider>
      jsxElements.forEach((element) => {
        const guiProviderWrapper = j.jsxElement(
          j.jsxOpeningElement(j.jsxIdentifier('GUIProvider'), []),
          j.jsxClosingElement(j.jsxIdentifier('GUIProvider')),
          [element.node]
        );
        // Replace the JSX element with the wrapped <GUIProvider>
        j(element).replaceWith(guiProviderWrapper);
      });
      // Write the modified content back to the file
      //   fs.writeFileSync(fileInfo.path, root.toSource(), 'utf-8');
    }
    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
