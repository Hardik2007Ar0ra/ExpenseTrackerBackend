import "dotenv/config"
import connectDB from "./db/connectDB.js"
import app from "./app.js"

connectDB()
    .then(()=>{
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    })
    .catch((err)=>{
        console.log("DB connection failed: ", err);
    })