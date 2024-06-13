import { Transform, FileInfo, API, ExpressionStatement } from 'jscodeshift';

const transform: Transform = (file: FileInfo, api: API) => {
  try {
    const j = api.jscodeshift.withParser('tsx');
    const root = j(file.source);

    let defaultExportName: string | null = null;
    let isJSXComponent = false;

    root.find(j.ExportDefaultDeclaration).forEach((path) => {
      const declaration = path.value.declaration;

      if (declaration.type === 'Identifier') {
        const binding = root.find(j.VariableDeclarator, {
          id: { name: declaration.name },
        });
        binding.forEach((bPath) => {
          if (bPath.value.init) {
            if (
              bPath.value.init.type === 'ArrowFunctionExpression' ||
              bPath.value.init.type === 'FunctionExpression'
            ) {
              if (j(bPath.value.init.body).find(j.JSXElement).size() > 0) {
                isJSXComponent = true;
              }
            }
          }
        });
        defaultExportName = declaration.name;
      } else if (declaration.type === 'FunctionDeclaration') {
        if (j(declaration.body).find(j.JSXElement).size() > 0) {
          isJSXComponent = true;
        }
        defaultExportName = declaration.id ? declaration.id.name : null;
      } else if (declaration.type === 'ClassDeclaration') {
        defaultExportName = declaration.id ? declaration.id.name : null;
      } else if (
        declaration.type === 'CallExpression' &&
        declaration.callee.type === 'Identifier'
      ) {
        defaultExportName = declaration.callee.name;
      } else if (
        declaration.type === 'ArrowFunctionExpression' ||
        declaration.type === 'FunctionExpression'
      ) {
        if (j(declaration.body).find(j.JSXElement).size() > 0) {
          isJSXComponent = true;
        }
        defaultExportName = 'AnonymousFunction';
      }
    });

    if (isJSXComponent) {
      return `${defaultExportName} (JSX Component)`;
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
