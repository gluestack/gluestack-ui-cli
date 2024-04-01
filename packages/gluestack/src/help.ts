export function displayHelp(options: any) {
  const frameworkOptions = options.framework;
  const styleOptions = options.style.default.options;
  console.log('Usage: create-gluestack [project-name] [options]');
  console.log('Options:\n');
  // framework options
  console.log('  framework options:');
  const rnOptions = frameworkOptions.default.options[2];
  console.log(`    --${rnOptions.value.padEnd(23)} ${rnOptions.hint}`);
  frameworkOptions.Route.next.options.forEach((option: any) => {
    console.log(`    --${option.value.padEnd(23)} ${option.hint}`);
  });
  frameworkOptions.Route.expo.options.forEach((option: any) => {
    console.log(`    --${option.value.padEnd(23)} ${option.hint}`);
  });
  // styling options
  console.log('  style options:');
  styleOptions.forEach((option: any) => {
    console.log(
      `    --${option.value.padEnd(23)} ${option.label}: ${option.hint}`
    );
  });
  // help options
  console.log('  help options:');
  ['--help', '-h'].forEach((option) => {
    console.log(`    ${option.padEnd(25)} show help`);
  });

  process.exit(0);
}
