const express = require("express"); //express framework to have a higher level of methods
const app = express(); //assign app variable the express class/method
const cors = require("cors");
app.use(cors());
app.use(express.json());

const { spawn } = require("child_process");

const child = spawn("cmd");
//Hello Neejor
child.stdin.setEncoding("utf-8");
// child.stdout.pipe(process.stdout);
child.stdin.write("d:\n");
child.stdin.write(""); //Location
child.stdin.write(`ipython -c "%run <notebook>.ipynb"\n`);

child.on("exit", function (code, signal) {
  console.log(
    "child process exited with " + `code ${code} and signal ${signal}`
  );
});

child.stdout.on("data", (data) => {
  if (data.length) console.log(`child stdoutData:\n${data}`);
});

child.stderr.on("data", (data) => {
  if (data.length) console.error(`child stderrErr:\n${data}`);
});

app.get("/", function (req, res) {
  child.stdin.write("node -v\n");
  res.send("Working server");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening ma g");
});
