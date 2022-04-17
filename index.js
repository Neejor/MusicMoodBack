const express = require("express"); //express framework to have a higher level of methods
const app = express(); //assign app variable the express class/method
const cors = require("cors");

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const port = process.env.PORT || 4000;
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("port", port);
app.use(cors());
app.use(express.json());

const { spawn } = require("child_process");

const child = spawn("cmd");

child.stdin.setEncoding("utf-8");
child.stdin.write("d:\n");
// child.stdin.write(""); //Location
// child.stdin.write(`ipython -c "%run <notebook>.ipynb"\n`);

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

app.get("/pop", (req, res) => {
  io.sockets.emit("hey", "no");
  res.send("Working");
});

app.get("/", function (req, res) {
  io.sockets.emit("hey", "no");
  child.stdin.write(`cd "Untitled Folder"\n`);
  child.stdin.write(`ipython -c "%run Wow.ipynb"\n`);
  res.send("Working server");
});

setTimeout(() => {
  io.sockets.emit("hey", "no");
}, 5000);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("wow", () => {
    console.log("baby");
  });
});

server.listen(port, () => {
  console.log("Server listening on *:4000");
});
