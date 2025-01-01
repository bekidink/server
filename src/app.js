import "dotenv/config";
import fastify from "fastify";
import {connectDB} from "./config/db.js"
import { PORT } from "./config/config.js";
import { buildAdminRouter } from "./config/setup.js";
import { registerRoutes } from "./routes/index.js";
const start = async () => {
   
  connectDB(process.env.MONGO_URI);
  const app = fastify();
  
  await buildAdminRouter(app);
  await registerRoutes(app);
  // const PORT=process.env.PORT || 3000
  app.listen({ port: PORT }, (err, addr) => {
    if (err) {
    } else {
      console.log(`server run on ${PORT}`);
    }
  });
};
start();
