const socketHandler = (io) => {
  const emailToSocketIdMap = new Map();
  const socketIdToEmailMap = new Map();

  io.on("connection", (socket) => {
    socket.on("room:join", (data) => {
      console.log(data);
      const { email, room } = data;

      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);

      io.to(room).emit("user:joined", { email, id: socket.id });
      socket.join(room);
      console.log("room:join----->", data);
      io.to(socket.id).emit("room:join", data);

      socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incomming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
      });

      socket.on("peer:negotiation:needed", ({ to, offer }) => {
        io.to(to).emit("peer:negotiation:needed", { from: socket.id, offer });
      });

      socket.on("peer:negotiation:done", ({ to, ans }) => {
        io.to(to).emit("peer:negotiation:final", { from: socket.id, ans });
      });
    });
  });
};

module.exports = socketHandler;
