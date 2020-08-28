function assertInteger(debugPath, i) {
  if (i === "0x0") {
    return;
  }
  if (!/^0x[1-9a-fA-F][0-9a-fA-F]*$/.test(i)) {
    throw new Error(`${debugPath} must be a hex integer!`);
  }
}

assertInteger("jeje", "0x2363E7F00");
