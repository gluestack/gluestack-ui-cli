import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const cssImporPath = options.cssImportPath || './global.css';
  const componentsImportPath = options.componentsPath;

  function removeExtraParanthesisInFile() {
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
  }

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
      j.jsxOpeningElement(j.jsxIdentifier('GluestackUIProvider'), [
        j.jsxAttribute(j.jsxIdentifier('mode'), j.literal('light')),
      ]),
      j.jsxClosingElement(j.jsxIdentifier('GluestackUIProvider')),
      [jsxElement]
    );
    return newParentJSXElement;
  };

  //if there is an import for GluestackUIProvider from @gluestack-ui/themed, then remove GluestackUIProvider from imports
  const gluestackUIProviderImport = root.find(j.ImportDeclaration, {
    source: { value: '@gluestack-ui/themed' },
  });
  if (gluestackUIProviderImport.size()) {
    gluestackUIProviderImport.forEach((path) => {
      if (path.node.specifiers) {
        const gluestackUIProvider = path.node.specifiers.find(
          (specifier) =>
            specifier.local && specifier.local.name === 'GluestackUIProvider'
        );
        if (gluestackUIProvider) {
          if (gluestackUIProviderImport.find(j.ImportSpecifier).size() === 1) {
            gluestackUIProviderImport.remove();
          } else {
            path.node.specifiers = path.node.specifiers.filter(
              (specifier) =>
                specifier.local &&
                specifier.local.name !== 'GluestackUIProvider'
            );
          }
        }
      }
    });
  }

  removeExtraParanthesisInFile();
  // const themeProviderElement = root.find(j.JSXElement, {
  //   openingElement: { name: { name: 'ThemeProvider' } },
  // });
  const GluestackUIProviderElement = root.find(j.JSXElement, {
    openingElement: { name: { name: 'GluestackUIProvider' } },
  });
  //replace ThemeProvider Tag with GluestaackUIProvider
  if (!GluestackUIProviderElement.size()) {
    root.find(j.ReturnStatement).forEach((path) => {
      // Check if the return statement is returning a JSX element
      if (path.node.argument && path.node.argument.type === 'JSXElement') {
        // Wrap the existing JSX element with the new parent
        path.node.argument = wrapJSXWithParent(path.node.argument);
      }
    });
  } else if (GluestackUIProviderElement.size()) {
    //and change the attributes of GluestackUIProvider
    GluestackUIProviderElement.forEach((path) => {
      const children = path.node.children;
      const currentProps = path.node.openingElement.attributes;
      let hasModeAttribute = false;
      currentProps?.forEach((item) => {
        if (item.type === 'JSXAttribute' && item.name.name === 'config') {
          item.name.name = 'mode';
          item.value = j.literal('light');
          hasModeAttribute = true;
        } else if (!hasModeAttribute) {
          currentProps?.push(
            j.jsxAttribute(j.jsxIdentifier('mode'), j.literal('light'))
          );
        }
      });

      path.node.children = children;
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
