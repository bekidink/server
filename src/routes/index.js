import { authRoutes } from "./auth.route.js"

const prefix="/api"
export const registerRoutes=async(fastify)=>{
    fastify.register(authRoutes,{prefix:prefix})
}