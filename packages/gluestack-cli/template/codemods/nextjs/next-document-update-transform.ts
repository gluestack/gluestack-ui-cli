import { Transform } from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = api.jscodeshift.withParser('tsx');
    const root = j(file.source);

    // Add the necessary imports
    if (
      root
        .find(j.ImportDeclaration, {
          source: { value: 'react' },
        })
        .size() === 0
    ) {
      root
        .find(j.ImportDeclaration)
        .at(0)
        .insertBefore(
          j.importDeclaration(
            [j.importDefaultSpecifier(j.identifier('React'))],
            j.literal('react')
          )
        );
    }

    if (
      root
        .find(j.ImportDeclaration, {
          source: { value: 'react-native-web' },
        })
        .size() === 0
    ) {
      root
        .find(j.ImportDeclaration)
        .at(0)
        .insertAfter(
          j.importDeclaration(
            [j.importSpecifier(j.identifier('AppRegistry'))],
            j.literal('react-native-web')
          )
        );
    }
    if (
      root
        .find(j.ImportDeclaration, {
          source: { value: '@gluestack-ui/nativewind-utils/flush' },
        })
        .size() === 0
    ) {
      root
        .find(j.ImportDeclaration)
        .at(0)
        .insertAfter(
          j.importDeclaration(
            [j.importSpecifier(j.identifier('flush'))],
            j.literal('@gluestack-ui/nativewind-utils/flush')
          )
        );
    }

    // Define the getInitialProps method as a string
    const getInitialProps = `
Document.getInitialProps = async ({ renderPage }) => {
  AppRegistry.registerComponent("Main", () => Main);
  const { getStyleElement } = AppRegistry.getApplication("Main");
  const page = await renderPage();
  const styles = [getStyleElement(), flush()];
  return { ...page, styles: React.Children.toArray(styles) };
};
`;

    // Add getInitialProps method to the end of the file
    root
      .find(j.Program)
      .get('body')
      .push(j.template.statement([getInitialProps]));

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
