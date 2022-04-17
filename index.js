const axios = require("axios");
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
const accessToken =
  "BQC8GJ_3U5AptxmgtqyjsCaoW-P13XTvgGtvVmCifRCypcgPWOdOhN335U7p5WqZQAwE-ouzy8gX6y7WvtOfTSdufseOicL9UenEggO-ADBBR-Dgy-rkmg68zyh1LJW6Cl6Bco6ViHiNXHA177VbuZBExvSxLkf-krAZxf7qbBWjduM";
const { spawn } = require("child_process");

const child = spawn("cmd");
//Hello Neejor
child.stdin.setEncoding("utf-8");
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

  axios
    .get(
      "https://api.spotify.com/v1/search",
      {
        params: {
          limit: 50,
          offset: Math.floor(Math.random() * 60),
          q: "jazz",
          type: "track",
        },
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
  // console.log(`child stdoutData:\n${data}`);
});

child.stderr.on("data", (data) => {
  console.error(`child stderrErr:\n${data}`);
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
