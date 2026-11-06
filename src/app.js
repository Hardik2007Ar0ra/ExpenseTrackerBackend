import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.get('/', (req,res)=>{
    console.log("running fine")
    res.send("setup complete")
})

app.use(cookieParser)

import userRouter from "./routes/user.routes.js"
import expenseRouter from "./routes/expense.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/expense",expenseRouter)

export default app;