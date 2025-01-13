import "dotenv/config";
import fastify from "fastify";
import { connectDB } from "./config/db.js";
import { PORT } from "./config/config.js";
import { buildAdminRouter } from "./config/setup.js";
import { registerRoutes } from "./routes/index.js";
import fastifySocketIo from "fastify-socket.io";
const start = async () => {
  connectDB(process.env.MONGO_URI);
  const app = fastify();
  app.register(fastifySocketIo, {
    cors: {
      origin: "*",
    },
    pingInterval: 1000,
    pingTimeout: 5000,
    transports: ["websocket"],
  });
  await buildAdminRouter(app);
  await registerRoutes(app);
  // const PORT=process.env.PORT || 3000
  app.listen({ port: PORT }, (err, addr) => {
    if (err) {
    } else {
      console.log(`server run on ${PORT}`);
    }
  });
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("A User Connected");
      socket.on("joinRoom",(orderId)=>{
        socket.join(orderId)
        console.log(`user joined room ${orderId}`)
      })
      socket.on('disconnect',()=>{
        console.log("A User disConnected");
      })
    });
  });
};

start();
