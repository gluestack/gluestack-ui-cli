import { Transform } from 'jscodeshift';
import { NextResolvedConfig } from '../../../src//util/config-generate/config-types';

const transform: Transform = (file, api, options) => {
  try {
    const j = api.jscodeshift.withParser('tsx');
    const root = j(file.source);
    const config: NextResolvedConfig = options.config || {};
    const componentsImportPath = options.componentsPath;

    /* condition to check if StyledJsxRegistry is needed */
    const hasStyledJsx = config.app.entry?.includes('layout') || false;

    const bodyElement = root.find(j.JSXElement, {
      openingElement: { name: { name: 'body' } },
    });
    const alreadyWrappedWithGluestack =
      bodyElement
        .find(j.JSXElement, {
          openingElement: { name: { name: 'GluestackUIProvider' } },
        })
        .size() > 0;
    const alreadyWrappedWithStyledJsx =
      bodyElement
        .find(j.JSXElement, {
          openingElement: { name: { name: 'StyledJsxRegistry' } },
        })
        .size() > 0;

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
    removeExtraParanthesisInFile();
    if (
      hasStyledJsx &&
      !alreadyWrappedWithStyledJsx &&
      !alreadyWrappedWithGluestack
    ) {
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
    }

    if (!hasStyledJsx && !alreadyWrappedWithGluestack) {
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
    removeExtraParanthesisInFile();

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
