#!/usr/bin/env node
const { componentAdder } = require("./component-adder");
const { initializer } = require("./installer/initializer");

const main = async () => {
  const askUserToInit = true;
  if (
    process.argv.length === 2 ||
    (process.argv.length === 3 && process.argv[2] === "add")
  ) {
    await initializer(askUserToInit);
    await componentAdder();
  } else if (process.argv.length >= 3 && process.argv[2] === "init") {
    await initializer(!askUserToInit);
  } else if (process.argv.length >= 4 && process.argv[2] === "add") {
    if (process.argv[3]) {
      await initializer(askUserToInit);
      await componentAdder(process.argv[3]);
    }
  } else if (process.argv.length === 3 && process.argv[2] == "help") {
    console.log("Coming soon!!!");
  }
};

main();
