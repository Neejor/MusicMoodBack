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

const fs = require("fs");

const rateLimit = require("axios-rate-limit");
const promiseRetry = require("promise-retry");

const axiosCreate = axios.create();
const axiosCust = rateLimit(axiosCreate, {
  maxRequests: 11,
  perMilliseconds: 1000,
});

var querystring = require("querystring");

let accessToken =
  "BQCQ8Bo0-IWfstEBqQDyiFzWRbOy_ERqE9PExFidyDhs8sL0eXVCuGEYQZCQEDBcBirITRfBjlJSR0bnXKZlSlNUc5AM5Mizn6H8WYVVD_fhHCi0OacK-T2Tslzv-Ge7i096CiW03DZii4TGgXEXYIvtnZuFY9RPLICune1ojrChnf-8WGdqWZMQjFBur3W_IssCQ8ikTt381XZwcpT3p8uacP-P_No0paMnAEUclyxFgYK-C9umCg";
const refreshToken =
  "AQAjmj5dFqS_vEt3j8iYrE7d0SnErqFytOjaZmR-q35F1NFK2DgS6dbFZLQgrz-ATxrHc2AxURTnyrgeqskumvGPNb4M7opJF-e0nYCfgIVo8--F2T_js5ebmrblcFh1KNU";
const { spawn } = require("child_process");

const child = spawn("cmd");
//Hello Neejor
child.stdin.setEncoding("utf-8");
// child.stdin.write("d:\n");
// child.stdin.write("cd musicfiles\n"); //Location
// child.stdin.write(`ipython -c "%run model_use.ipynb"\n`);

let moodMap = new Map();
moodMap.set("joy", ["pop", "rock"]);
moodMap.set("sadness", ["indie", "jazz"]);
moodMap.set("love", ["soul", "blues"]);
moodMap.set("anger", ["metal", "rock"]);

const returnString = (e) => {
  x = "";
  for (var i = 2; i < e.length && e[i] != 39; i++) {
    x = x.concat(String.fromCharCode(e[i]));
  }
  return x;
};

child.on("exit", function (code, signal) {
  console.log(
    "child process exited with " + `code ${code} and signal ${signal}`
  );
});

const addToPlaylist = async (playlistId, playlist) => {
  await Promise.allSettled(
    playlist.map(async (uri) => {
      return promiseRetry(
        async (retry, num) => {
          console.log("Attempt Number: ", num);
          try {
            await axiosCust.post(
              `https://api.spotify.com/v1/playlists/${playlistId}/tracks?` +
                querystring.stringify({
                  uris: uri,
                }),
              JSON.stringify({}),
              {
                headers: {
                  Accept: "application/json",
                  Authorization: "Bearer " + accessToken,
                  "Content-Type": "application/json",
                },
              }
            );
          } catch (e) {
            console.log(e);
            retry();
          }
        },
        {
          retries: 5,
        }
      ).catch((e) => {
        return Promise.reject({
          code: 500,
          message: "Stopped after 5 retries",
        });
      });
    })
  );
};

const returnPlaylist = async (playlist, mood) => {
  try {
    const data = {
      name: "PlaylistFinal",
      description: "New playlist description",
      public: false,
    };

    // const userId = await axiosCust.get("https://api.spotify.com/v1/me", {
    //   headers: {

    //   }
    // })

    let playlistId = await axiosCust.post(
      "https://api.spotify.com/v1/users/cg22w/playlists",
      JSON.stringify(data),
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log(playlistId);
    playlistId = playlistId.data.id;
    console.log("playlistLid:", playlistId);

    await Promise.all(
      moodMap.get(mood).map(async (currentGenre) => {
        const tracks = await axiosCust.get(
          "https://api.spotify.com/v1/search?" +
            querystring.stringify({
              limit: 10,
              offset: Math.floor(Math.random() * 60),
              q: currentGenre,
              type: "track",
            }),
          {
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + accessToken,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(tracks.data.tracks.items[0].uri);

        await Promise.all(
          tracks.data.tracks.items.map(async (track) => {
            await playlist.push(track.uri);
          })
        );
      })
    );

    // console.log(playlist);
    console.log("uri: ", playlist[0]);
    console.log(playlist.length);
    // await axiosCust.post(
    //   `https://api.spotify.com/v1/playlists/${playlistId}/tracks?` +
    //     querystring.stringify({
    //       uris: playlist[0],
    //     }),
    //   JSON.stringify({}),
    //   {
    //     headers: {
    //       Authorization: "Bearer " + accessToken,
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    playlist = playlist
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    await addToPlaylist(playlistId, playlist);
    io.sockets.emit("playlistId", { playlistId });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
    } else if (err.request) {
      console.log(err.request);
    } else {
      console.log("Error", err.message);
    }
  }
};

child.stdout.on("data", (data) => {
  let mood;
  if (data[0] == 91) {
    mood = returnString(data);

    let playlist = [];
    returnPlaylist(playlist, mood);
  }

  // axiosCust
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
    "user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private";

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

  axiosCust
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
    .then((resD) => {
      accessToken = resD.data.access_token;
      console.log(accessToken);
      res.redirect("http://localhost:3000?getAT=true");
    });
});

app.get("/playlist", async (req, res) => {
  let playlist = [];
  let mood = "joy";
  await returnPlaylist(playlist, mood);
  // await axiosCust.post(
  //   `https://api.spotify.com/v1/playlists/${playlistId}/tracks?` +
  //     querystring.stringify({
  //       uris: uri,
  //     }),
  //   {
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: "Bearer " + accessToken,
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );
  res.send("works");
});

app.get("/getSongs", (req, res) => {
  axiosCust
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

app.post("/getPlaylists", (req, res) => {
  console.log(req.body.transcript);
  fs.writeFile(
    "D:\\WebDev\\Untitled Folder\\no.txt",
    req.body.transcript,
    (err, data) => {
      if (err) throw err;
      child.stdin.write("d:\n");
      child.stdin.write("cd musicfiles\n"); //Location
      child.stdin.write(`ipython -c "%run model_use.ipynb"\n`);
    }
  );

  res.send("S");
});

app.get("/", function (req, res) {
  io.sockets.emit("hey", "no");
  // child.stdin.write(`cd "Untitled Folder"\n`);
  // child.stdin.write(`ipython -c "%run Wow.ipynb"\n`);
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
