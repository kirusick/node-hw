process.stdin.on("data", (buffer) => {
  const reversedString = buffer.toString("utf8").split("").reverse().join("");

  process.stdout.write(reversedString + "\n");
});
