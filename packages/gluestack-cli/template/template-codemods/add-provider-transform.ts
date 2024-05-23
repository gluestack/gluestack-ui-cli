import j, { Transform, ExportDefaultDeclaration } from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = api.jscodeshift.withParser('tsx');
    const root = j(file.source);
    // ------------------------------------------------------------------------------
    // add a string literal to the file doesn't have to be inside any jsx element
    // root
    //   .get()
    //   .node.program.body.push(
    //     j.expressionStatement(j.stringLiteral('Hello, World!'))
    //   );
    // ------------------------------------------------------------------------------
    const identifiers: string[] = [];
    const jsxElements: any[] = [];
    let defaultExportFunctionBody: any = null;
    // Function to check if a node is a JSX element
    function isJSXElement(node: any): boolean {
      return node && node.type && node.type.startsWith('JSX');
    }

    root.find(j.ExportDefaultDeclaration).forEach((path) => {
      const node = path.node as ExportDefaultDeclaration;

      if (node.declaration.type === 'Identifier') {
        identifiers.push(node.declaration.name);
      } else if (node.declaration.type === 'FunctionDeclaration') {
        const functionDeclaration = node.declaration;
        if (
          functionDeclaration.body &&
          functionDeclaration.body.type === 'BlockStatement'
        ) {
          functionDeclaration.body.body.forEach((statement: any) => {
            if (
              statement.type === 'ReturnStatement' &&
              statement.argument &&
              statement.argument.type === 'JSXElement'
            ) {
              // Store the JSX elements returned by the function
              defaultExportFunctionBody = functionDeclaration.body;
            }
          });
        }
      }
      // Wrap the JSX elements with <GUIprovider> tag
      if (defaultExportFunctionBody) {
        root
          .get()
          .node.program.body.push(
            j.expressionStatement(j.stringLiteral('Hello, World!'))
          );
        defaultExportFunctionBody.body = [
          j.returnStatement(
            j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier('GUIprovider'), []),
              j.jsxClosingElement(j.jsxIdentifier('GUIprovider')),
              [defaultExportFunctionBody.body]
            )
          ),
        ];
      }

      // condition for fetching identifiers from default arrow function

      // else if (node.declaration.type === 'ArrowFunctionExpression') {
      //   const arrowFunction = node.declaration as j.ArrowFunctionExpression;
      //   if (
      //     arrowFunction.params.length === 1 &&
      //     arrowFunction.params[0].type === 'Identifier'
      //   ) {
      //     // Arrow function with a single identifier parameter
      //     identifiers.push((arrowFunction.params[0] as j.Identifier).name);
      //   }
      // }
    });

    // root.find(j.Program).forEach((path) => {
    //   const statements = path.node.body;

    //   // Adding identifiers as string literals
    //   identifiers.forEach((identifier) => {
    //     statements.unshift(j.expressionStatement(j.stringLiteral(identifier)));
    //   });
    // });
    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;

// Initialize an array to store JSX elements found for export default declarations
// const jsxElementsForExports: any[] = [];

// Find all export default declarations
// root.find(j.ExportDefaultDeclaration).forEach((path) => {
//   const declaration = path.node.declaration;
//   if (j.Identifier.check(declaration)) {
//     const identifier = declaration.name;
//     // Find all ReturnStatements returning JSX elements with the same identifier
//     root.find(j.ReturnStatement).forEach((returnPath) => {
//       const argument = returnPath.node.argument;
//       if (argument && argument.type === 'JSXElement') {
//         // Check if the returned JSX element matches the export default identifier
//         const usedIdentifier =
//           j(argument).find(j.Identifier, { name: identifier }).length > 0;
//         if (usedIdentifier) {
//           jsxElementsForExports.push(argument);
//         }
//       }
//     });
//   }
// });

// If JSX elements were found for export default declarations, log them
// if (jsxElementsForExports.length > 0) {
//   root
//     .get()
//     .node.program.body.push(
//       j.expressionStatement(
//         j.stringLiteral(
//           'JSX Elements being returned and exported as default'
//         )
//       )
//     );
// } else {
//   root
//     .get()
//     .node.program.body.push(
//       j.expressionStatement(
//         j.stringLiteral(
//           'No JSX Elements being returned or exported as default found.'
//         )
//       )
//     );
// }
