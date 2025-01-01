import jwt from "jsonwebtoken"
export const verifytoken=async(req,res)=>{
    try {
        const authHeader=req.headers["authorization"];
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).send({
                message:"Access token request"
            })
        }
        const token=authHeader.split(" ")[1];
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        req.user=decoded;
        return true
    } catch (error) {
        return res.status(403).send({message:'Invalid or expired token'})
    }
}