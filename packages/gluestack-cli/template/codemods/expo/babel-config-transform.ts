import {
  Transform,
  FileInfo,
  API,
  ReturnStatement,
  ObjectExpression,
  Property,
} from 'jscodeshift';

const transform: Transform = (file: FileInfo, api: API): string => {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);

    root.find<ReturnStatement>(j.ReturnStatement).forEach((path) => {
      const returnObject = path.node.argument as ObjectExpression | null;

      if (returnObject && returnObject.type === 'ObjectExpression') {
        let presetsProperty = returnObject.properties.find(
          (property) =>
            property.type === 'Property' &&
            (property.key as any).name === 'presets'
        ) as Property | undefined;

        let pluginsProperty = returnObject.properties.find(
          (property) =>
            property.type === 'Property' &&
            (property.key as any).name === 'plugins'
        ) as Property | undefined;

        const nativewindPreset = j.arrayExpression([
          j.stringLiteral('babel-preset-expo'),
          j.objectExpression([
            j.objectProperty(
              j.identifier('jsxImportSource'),
              j.stringLiteral('nativewind')
            ),
          ]),
        ]);

        const nativewindBabel = j.stringLiteral('nativewind/babel');

        if (!presetsProperty) {
          returnObject.properties.push(
            j.objectProperty(
              j.identifier('presets'),
              j.arrayExpression([nativewindPreset, nativewindBabel])
            )
          );
        } else {
          const presetsArray = presetsProperty.value as any;
          if (
            presetsArray.type === 'ArrayExpression' &&
            !presetsArray.elements.some(
              (element: any) =>
                element.type === 'ArrayExpression' &&
                element.elements[0].value === 'babel-preset-expo' &&
                element.elements[1].properties.some(
                  (prop: any) =>
                    prop.key.name === 'jsxImportSource' &&
                    prop.value.value === 'nativewind'
                )
            )
          ) {
            presetsArray.elements = [
              nativewindPreset,
              ...presetsArray.elements.filter(
                (element: any) => element.type === 'StringLiteral'
              ),
              nativewindBabel,
            ];
          }
        }

        const moduleResolverPlugin = j.arrayExpression([
          j.stringLiteral('module-resolver'),
          j.objectExpression([
            j.objectProperty(
              j.identifier('root'),
              j.arrayExpression([j.stringLiteral('./')])
            ),
            j.objectProperty(
              j.identifier('alias'),
              j.objectExpression([
                j.objectProperty(j.stringLiteral('@'), j.stringLiteral('./')),
              ])
            ),
          ]),
        ]);

        if (!pluginsProperty) {
          returnObject.properties.push(
            j.objectProperty(
              j.identifier('plugins'),
              j.arrayExpression([moduleResolverPlugin])
            )
          );
        } else {
          const pluginsArray = pluginsProperty.value as any;
          if (
            pluginsArray.type === 'ArrayExpression' &&
            !pluginsArray.elements.some(
              (element: any) =>
                element.type === 'ArrayExpression' &&
                element.elements[0].value === 'module-resolver' &&
                element.elements[1].properties.some(
                  (prop: any) =>
                    prop.key.name === 'root' &&
                    prop.value.elements.some(
                      (rootElement: any) => rootElement.value === './'
                    ) &&
                    prop.key.name === 'alias' &&
                    prop.value.properties.some(
                      (aliasProperty: any) =>
                        aliasProperty.key.value === '@' &&
                        aliasProperty.value.value === './'
                    )
                )
            )
          ) {
            pluginsArray.elements = [
              moduleResolverPlugin,
              ...pluginsArray.elements.filter(
                (element: any) => element.type === 'ArrayExpression'
              ),
            ];
          }
        }
      }
    });

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return file.source;
  }
};

export default transform;
