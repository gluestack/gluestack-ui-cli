import { Transform, Node } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift.withParser('tsx');
    const root = j(file.source);
    const componentsImportPath = options.componentsPath;
    const cssImporPath = options.cssImportPath || './global.css';

    let defaultExportName = '';

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
            if (
              gluestackUIProviderImport.find(j.ImportSpecifier).size() === 1
            ) {
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

    root.find(j.ExportDefaultDeclaration).forEach((path) => {
      const declaration = path.node.declaration;
      if (declaration.type === 'Identifier') {
        defaultExportName = declaration.name;
      } else if (
        declaration.type === 'FunctionDeclaration' ||
        declaration.type === 'ClassDeclaration'
      ) {
        defaultExportName = declaration.id?.name || ''; // Add null check here
      }
    });

    // Function to check if GlustackUIProvider exists as a JSX element
    const GluestackUIProviderElement = root.find(j.JSXElement, {
      openingElement: { name: { name: 'GluestackUIProvider' } },
    });

    let hasAppFunction = false;
    removeExtraParanthesisInFile();
    // Find all FunctionDeclarations with identifier "App"
    root
      .find(j.FunctionDeclaration, {
        id: { name: defaultExportName },
      })
      .forEach((path) => {
        hasAppFunction = true;
        j(path)
          .find(j.ReturnStatement)
          .forEach((returnPath) => {
            const argument = returnPath.node.argument;
            if (
              argument &&
              (argument.type === 'JSXElement' ||
                argument.type === 'JSXFragment')
            ) {
              if (!GluestackUIProviderElement.size()) {
                // Wrap the JSXElement with <GluestackUIProvider> tag
                returnPath.replace(
                  j.returnStatement(
                    j.jsxElement(
                      j.jsxOpeningElement(
                        j.jsxIdentifier('GluestackUIProvider'),
                        [
                          j.jsxAttribute(
                            j.jsxIdentifier('mode'),
                            j.literal('light')
                          ),
                        ]
                      ),
                      j.jsxClosingElement(
                        j.jsxIdentifier('GluestackUIProvider')
                      ),
                      [argument]
                    )
                  )
                );
              } else {
                //and change the attributes of GluestackUIProvider
                GluestackUIProviderElement.forEach((path) => {
                  const children = path.node.children;
                  const currentProps = path.node.openingElement.attributes;
                  let hasModeAttribute = false;
                  currentProps?.forEach((item) => {
                    if (
                      item.type === 'JSXAttribute' &&
                      item.name.name === 'config'
                    ) {
                      item.name.name = 'mode';
                      item.value = j.literal('light');
                      hasModeAttribute = true;
                    } else if (!hasModeAttribute) {
                      currentProps?.push(
                        j.jsxAttribute(
                          j.jsxIdentifier('mode'),
                          j.literal('light')
                        )
                      );
                    }
                  });

                  path.node.children = children;
                });
              }
            }
          });
      });

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
