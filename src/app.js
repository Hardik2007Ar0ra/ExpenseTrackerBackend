import express from "express"
import cors from "cors"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.get('/', (req,res)=>{
    console.log("running fine")
    res.send("setup complete")
})

export default app;