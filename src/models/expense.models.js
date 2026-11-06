import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema({
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ["Cash", "UPI", "Card", "Other"],
        default: "Other"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Expense = mongoose.model("Expense", expenseSchema);
