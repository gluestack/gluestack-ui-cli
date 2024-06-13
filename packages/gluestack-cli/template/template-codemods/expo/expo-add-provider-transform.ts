import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const cssImporPath = options.cssImportPath || './global.css';
  const componentsImportPath = options.componentsPath;

  // Add import for GluestackUIProvider
  if (
    root
      .find(j.ImportDeclaration, {
        source: { value: `@/${componentsImportPath}/gluestack-ui-provider` },
      })
      .size() === 0
  ) {
    root
      .find(j.ImportDeclaration)
      .at(0)
      .insertAfter(
        j.importDeclaration(
          [j.importSpecifier(j.identifier('GluestackUIProvider'))],
          j.literal(`@/${componentsImportPath}/gluestack-ui-provider`)
        )
      );
  }

  //add import for global.css
  if (
    root
      .find(j.ImportDeclaration, { source: { value: cssImporPath } })
      .size() === 0
  ) {
    root
      .find(j.ImportDeclaration)
      .at(0)
      .insertAfter(j.importDeclaration([], j.literal(cssImporPath)));
  }
  const wrapJSXWithParent = (jsxElement) => {
    // Create the new parent JSX element, e.g., a <div>
    const newParentJSXElement = j.jsxElement(
      j.jsxOpeningElement(j.jsxIdentifier('GluestackUIProvider'), []),
      j.jsxClosingElement(j.jsxIdentifier('GluestackUIProvider')),
      [jsxElement]
    );
    return newParentJSXElement;
  };

  const themeProviderElement = root.find(j.JSXElement, {
    openingElement: { name: { name: 'ThemeProvider' } },
  });
  //write code to replace ThemeProvider Tag with GluestaackUIProvider
  if (themeProviderElement.size()) {
    themeProviderElement.forEach((path) => {
      const children = path.node.children;

      const gluestackProvider = j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier('GluestackUIProvider'), [
          j.jsxAttribute(j.jsxIdentifier('mode'), j.literal('light')),
        ]),
        j.jsxClosingElement(j.jsxIdentifier('GluestackUIProvider')),
        children
      );

      path.node.children = [gluestackProvider];
      //@ts-ignore
      path.value.openingElement = '';
      //@ts-ignore
      path.value.closingElement = '';
    });
  } else {
    root.find(j.ReturnStatement).forEach((path) => {
      // Check if the return statement is returning a JSX element
      if (path.node.argument && path.node.argument.type === 'JSXElement') {
        // Wrap the existing JSX element with the new parent
        path.node.argument = wrapJSXWithParent(path.node.argument);
      }
    });
  }

  //to remove the extra paranthesis
  root.find(j.ReturnStatement).forEach((path) => {
    // Check if the return statement is returning a JSX element
    if (path.value.argument && path.value.argument.type !== 'JSXFragment') {
      if (path.node.argument && path.node.argument.type === 'JSXElement') {
        // remove the extra paranthesis
        // @ts-ignore
        if (path.node.argument.extra) {
          // @ts-ignore
          path.node.argument.extra.parenthesized = false;
        }
      }
    }
  });

  return root.toSource();
};

export default transform;
