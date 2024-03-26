const templateData = require('./config');
const { execPromise } = require('./utils');

// --template template-name
async function runner() {
  let templateList = process.argv.filter(
    (item) => !(item.includes('--') || item.includes('/'))
  );
  if (templateList.length === 0) {
    templateList = Object.keys(templateData.template);
  }

  for (template of templateList) {
    if (templateData.template?.[template]) {
      const targetPath = templateData.template[template].targetPath;
      const targetName = templateData.template[template].targetName;
      const patchPath = templateData.template[template].patchPath;
      const createCommand = templateData.template[template].createCommand;
      const createCommandArgs =
        templateData.template[template]?.createCommandArgs;
      const promptsList = templateData.template[template]?.promptsList;
      const postCreate = templateData.template[template]?.postCreate;

      await execPromise(
        template,
        targetPath,
        targetName,
        patchPath,
        createCommand,
        createCommandArgs,
        promptsList,
        postCreate
      );
    } else {
      console.log(
        'Error :',
        template,
        'not found in the template list. Exiting...\n\n'
      );
    }
  }
}

runner();
