import { log } from '@clack/prompts';

export const help = async () => {
  log.message(`
        \x1b[36m- Init and add components\x1b[0m
          \x1b[33mnpx gluestack-ui@latest\x1b[0m
        
        \x1b[36m- Init gluestack-ui\x1b[0m
          \x1b[33mnpx gluestack-ui@latest init\x1b[0m
          
        \x1b[36m- Add component\x1b[0m
          \x1b[33mnpx gluestack-ui@latest add <component-name>\x1b[0m
        
        \x1b[36m- Add all component\x1b[0m
          \x1b[33mnpx gluestack-ui@latest add --all\x1b[0m
          
        \x1b[36m- Update a component\x1b[0m
          \x1b[33mnpx gluestack-ui@latest update <component-name>\x1b[0m
          
        \x1b[36m- Update all component\x1b[0m
          \x1b[33mnpx gluestack-ui@latest update --all\x1b[0m
        
        \x1b[36m- Remove a component\x1b[0m
          \x1b[33mnpx gluestack-ui@latest remove <component-name>\x1b[0m
          
        \x1b[36m- Remove all component\x1b[0m
          \x1b[33mnpx gluestack-ui@latest remove --all\x1b[0m
        
        \x1b[36m- Help\x1b[0m
          \x1b[33mnpx gluestack-ui@latest help\x1b[0m   
                `);
};
