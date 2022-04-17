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

var querystring = require("querystring");

const accessToken =
  "BQDe-9VCDVGq1t3TBeGqy3si9qmHlfuTtM7_8a_TZ8H9LTSZZnyb65QXPF2V8Als_Rftdp0U9pkYm9eEhzuZG07amH8za8GsS-UjNKKUHjGyYLIuEvMfqfRaUeeggfs2aBM21YJ95O3lW2Wx_jglCipPctDt6dqWfuOS04oU8d_TTZsMrRtBHe2VQrw";
const refreshToken =
  "AQAjmj5dFqS_vEt3j8iYrE7d0SnErqFytOjaZmR-q35F1NFK2DgS6dbFZLQgrz-ATxrHc2AxURTnyrgeqskumvGPNb4M7opJF-e0nYCfgIVo8--F2T_js5ebmrblcFh1KNU";
const { spawn } = require("child_process");

const child = spawn("cmd");
//Hello Neejor
child.stdin.setEncoding("utf-8");
// child.stdin.write("d:\n");
// child.stdin.write("cd musicfiles\n"); //Location
// child.stdin.write(`ipython -c "%run model_use.ipynb"\n`);

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

  // axios
  //   .get(
  //     "https://api.spotify.com/v1/tracks/2TpxZ7JUBn3uw46aR7qd6V",
  //     // "https://api.spotify.com/v1/search",
  //     // {
  //     //   params: {
  //     //     limit: 10,
  //     //     offset: Math.floor(Math.random() * 60),
  //     //     q: "jazz",
  //     //     type: "track",
  //     //   },
  //     // },
  //     {
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: "Bearer " + accessToken,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   )
  //   .then((data) => console.log(data))
  //   .catch((err) => console.log(err));
  console.log(`child stdoutData:\n${data}`);
});

child.stderr.on("data", (data) => {
  console.error(`child stderrErr:\n${data}`);
});

app.get("/pop", (req, res) => {
  io.sockets.emit("hey", "no");
  res.send("Working");
});

var client_id = "d94cc50e05884b7294dded17bca4a06f";
var client_secret = "36c33e27fb5a48d6885fc27850ea7b0c";
var redirect_uri = "http://localhost:4000/acc";

app.get("/login", function (req, res) {
  var state = "basdasdsa";
  var scope =
    "user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        redirect_uri: redirect_uri,
        state: state,
        scope,
        show_dialog: true,
      })
  );
});

app.get("/acc", (req, res) => {
  console.log(req.query.code);
  const code = req.query.code;

  let data = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirect_uri,
    client_id,
    client_secret,
  };

  axios
    .post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            new Buffer(client_id + ":" + client_secret).toString("base64"),
        },
      }
    )
    .then((res) => console.log(res));
});

app.get("/getSongs", (req, res) => {
  axios
    .get(
      "https://api.spotify.com/v1/search?" +
        querystring.stringify({
          limit: 10,
          offset: Math.floor(Math.random() * 60),
          q: "jazz",
          type: "track",
        }),
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      }
    )
    .then((data) => res.send(data.data))
    .catch((err) => console.log(err));
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
