import { Transform } from 'jscodeshift';

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

    // Find all JSXElements being returned
    const jsxElements = root.find(j.ReturnStatement).filter((path) => {
      return !!path.value.argument && path.value.argument.type === 'JSXElement';
    });

    // Find the exported default JSXElement
    const exportedDefaultJSXElements = root
      .find(j.ExportDefaultDeclaration)
      .find(j.JSXElement);

    // Find the exported default JSXElement in the form `export default <JSXElement>`
    const exportedDefaultJSXElementsWithJSX = root
      .find(j.ExportDefaultDeclaration)
      .filter((path) => {
        const declaration = path.node.declaration;
        return j.JSXElement.check(declaration);
      })
      .find(j.JSXElement);

    const exportedDefaultJSXElement =
      exportedDefaultJSXElements.length > 0
        ? exportedDefaultJSXElements
        : exportedDefaultJSXElementsWithJSX;

    // If there are any JSXElements being returned and exported as default, log them
    if (jsxElements.length > 0 && exportedDefaultJSXElement.length > 0) {
      console.log(
        'JSX Element being returned and exported as default:',
        exportedDefaultJSXElement.get().value
      );
      root
        .get()
        .node.program.body.push(
          j.expressionStatement(
            j.stringLiteral(
              `JSX Element being returned and exported as default`
            )
          )
        );
    } else {
      console.log(
        'No JSX Element being returned or exported as default found.'
      );
      root
        .get()
        .node.program.body.push(
          j.expressionStatement(
            j.stringLiteral(
              `No JSX Element being returned or exported as default found.`
            )
          )
        );
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
