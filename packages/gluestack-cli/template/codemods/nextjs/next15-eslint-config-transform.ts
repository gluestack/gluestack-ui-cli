import { Transform } from 'jscodeshift';

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Look for eslintConfig array definition
  root
    .find(j.VariableDeclarator, { id: { name: 'eslintConfig' } })
    .forEach((path) => {
      const arrayExpression = path.node.init;

      if (arrayExpression && arrayExpression.type === 'ArrayExpression') {
        const newRuleObject = j.objectExpression([
          j.property(
            'init',
            j.identifier('rules'),
            j.objectExpression([
              j.property(
                'init',
                j.stringLiteral('@typescript-eslint/no-explicit-any'),
                j.stringLiteral('off')
              ),
            ])
          ),
        ]);

        // Ensure new rule object isn't already present
        const hasRuleAlready = arrayExpression.elements.some(
          (el) =>
            el &&
            el.type === 'ObjectExpression' &&
            el.properties.some(
              (prop) =>
                prop.key.type === 'Identifier' &&
                prop.key.name === 'rules' &&
                prop.value.type === 'ObjectExpression' &&
                prop.value.properties.some(
                  (rule) =>
                    rule.key.type === 'StringLiteral' &&
                    rule.key.value === '@typescript-eslint/no-explicit-any'
                )
            )
        );

        if (!hasRuleAlready) {
          arrayExpression.elements.push(newRuleObject);
        }
      }
    });

  return root.toSource();
};

export default transform;
