import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema({
    amount:{
        type:Number,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    paymentMethod:{
        type:String,
        enum:["Cash","UPI","Card"],
        default:"Other"
    }
})

export const Expense = mongoose.model("Expense", expenseSchema)