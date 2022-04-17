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
child.stdin.write("cd musicfiles\n"); //Location
child.stdin.write(`ipython -c "%run model_use.ipynb"\n`);

child.on("exit", function (code, signal) {
  console.log(
    "child process exited with " + `code ${code} and signal ${signal}`
  );
});

const returnString = (e) => {
  x = "";
  for (var i = 2; i < e.length && e[i] != 39; i++) {
    x = x.concat(String.fromCharCode(e[i]));
  }
  return x;
};

child.stdout.on("data", (data) => {
  var x;
  if (data[0] == 91) x = returnString(data);
  // console.log(`child stdoutData:\n${data}`);
});

child.stderr.on("data", (data) => {
  console.error(`child stderrErr:\n${data}`);
});

app.get("/", function (req, res) {
  child.stdin.write("node -v\n");
  res.send("Working server");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening ma g");
});
