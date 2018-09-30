const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 3000;

const messages = [];

const onlineUsers = [];

const isTyping = {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socket => {
  const username = socket.handshake.query.username;

  if (!username) {
    socket.disconnect(true);
    return;
  }
  
  onlineUsers.push(username);
  socket.emit("history", messages);
  
  io.emit("users", onlineUsers);
  io.emit("userConnected", username);

  socket.on("message", data => {
    const message = {
      username,
      data
    };
    messages.push(message);
    io.emit("message", message);
  });

  socket.on("isTyping", status => {
    isTyping[username] = status;
    io.emit("isTyping", isTyping);
  });

  socket.on("disconnect", () => {
    io.emit("userDisconnected", username);
  });
});

http.listen(port, () => {
  console.log("listening on *:" + port);
});
