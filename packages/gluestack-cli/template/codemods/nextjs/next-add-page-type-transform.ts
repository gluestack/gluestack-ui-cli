import { Transform } from 'jscodeshift';

const transform: Transform = (file, api) => {
  try {
    const j = api.jscodeshift.withParser('tsx');
    const root = j(file.source);

    // Check if 'use client' already exists
    const hasUseClient =
      root
        .find(j.ExpressionStatement, {
          expression: { value: 'use client' },
        })
        .size() > 0;

    // If 'use client' is not present, append it at the top
    if (!hasUseClient) {
      const useClientDirective = j.expressionStatement(j.literal('use client'));

      // Insert 'use client' at the top of the file
      root.get().node.program.body.unshift(useClientDirective);
    }

    return root.toSource();
  } catch (err) {
    console.log(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

export default transform;
