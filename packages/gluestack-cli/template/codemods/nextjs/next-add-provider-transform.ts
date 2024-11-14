import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift.withParser('tsx');
    const root = j(file.source);
    const componentsImportPath = options.componentsPath;
    const cssImportPath = options.cssImportPath;

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

    // Add import for GluestackUIProvider";
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

    // Add import for global.css or globals.css
    const cssFileImported =
      root
        .find(j.ImportDeclaration)
        .filter((path) => {
          const value = path.node.source.value;
          return (
            (value ?? '').toString().includes('global.css') ||
            (value ?? '').toString().includes('globals.css')
          );
        })
        .size() > 0;

    if (!cssFileImported) {
      root
        .find(j.ImportDeclaration)
        .at(0)
        .insertAfter(j.importDeclaration([], j.literal(cssImportPath)));
    }

    /* condition to check if StyledJsxRegistry is needed */
    const hasStyledJsx = file.path?.includes('layout') || false;

    const bodyElement = root.find(j.JSXElement, {
      openingElement: { name: { name: 'body' } },
    });
    const GluestackUIProviderElement = root.find(j.JSXElement, {
      openingElement: { name: { name: 'GluestackUIProvider' } },
    });
    const StyledJsxRegistryElement = bodyElement.find(j.JSXElement, {
      openingElement: { name: { name: 'StyledJsxRegistry' } },
    });
    const alreadyWrappedWithGluestack = GluestackUIProviderElement.size() > 0;
    const alreadyWrappedWithStyledJsx = StyledJsxRegistryElement.size() > 0;

    removeExtraParanthesisInFile();
    if (hasStyledJsx) {
      // Add import for StyledJsxRegistry;
      if (
        root
          .find(j.ImportDeclaration, { source: { value: './registry' } })
          .size() === 0
      ) {
        root
          .find(j.ImportDeclaration)
          .at(0)
          .insertAfter(
            j.importDeclaration(
              [j.importDefaultSpecifier(j.identifier('StyledJsxRegistry'))],
              j.literal('./registry')
            )
          );
      }

      if (!alreadyWrappedWithGluestack) {
        if (alreadyWrappedWithStyledJsx) {
          bodyElement.forEach((path) => {
            const styledJsxRegistry = path.node.children?.find(
              (child) =>
                child.type === 'JSXElement' &&
                (child.openingElement as any).name.name === 'StyledJsxRegistry'
            ) as any;

            if (styledJsxRegistry) {
              const gluestackProvider = j.jsxElement(
                j.jsxOpeningElement(j.jsxIdentifier('GluestackUIProvider'), [
                  j.jsxAttribute(j.jsxIdentifier('mode'), j.literal('light')),
                ]),
                j.jsxClosingElement(j.jsxIdentifier('GluestackUIProvider')),
                styledJsxRegistry.children
              );

              styledJsxRegistry.children = [gluestackProvider];
            }
          });
        } else if (!alreadyWrappedWithStyledJsx) {
          bodyElement.forEach((path) => {
            const children = path.node.children;

            const gluestackProvider = j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier('GluestackUIProvider'), [
                j.jsxAttribute(j.jsxIdentifier('mode'), j.literal('light')),
              ]),
              j.jsxClosingElement(j.jsxIdentifier('GluestackUIProvider')),
              children
            );

            const wrappedChildren = j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier('StyledJsxRegistry'), []),
              j.jsxClosingElement(j.jsxIdentifier('StyledJsxRegistry')),
              [gluestackProvider]
            );
            path.node.children = [wrappedChildren];
          });
        }
      } else {
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
    }
    if (!hasStyledJsx) {
      if (!alreadyWrappedWithGluestack) {
        // Target parent element containing the App component (adjust if needed)
        root.find(j.ReturnStatement).replaceWith((path) => {
          const componentElement = path.node.argument;

          const gluestackUIProviderElement = j.jsxElement(
            j.jsxOpeningElement(
              j.jsxIdentifier('GluestackUIProvider'),
              [j.jsxAttribute(j.jsxIdentifier('mode'), j.literal('light'))],
              false
            ),
            j.jsxClosingElement(j.jsxIdentifier('GluestackUIProvider')),
            [componentElement],
            //@ts-ignore
            false
          );

          return j.returnStatement(gluestackUIProviderElement);
        });
      } else {
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
    }

    removeExtraParanthesisInFile();

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
