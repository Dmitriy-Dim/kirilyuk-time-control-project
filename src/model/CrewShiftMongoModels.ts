import * as mongoose from "mongoose";
import { CrewShift, Break } from "./CrewShift.js";

const BreakSchema = new mongoose.Schema({
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    duration: { type: Number, enum: [15, 30], required: true }
}, { _id: false });

export const CrewShiftMongoSchema = new mongoose.Schema({
    shift_id: { type: String, required: true },
    startShift: { type: Number, required: true },
    finishShift: { type: Number, default: null },
    table_num: { type: String, required: true },
    shiftDuration: { type: Number, default: 0 },
    breaks: [BreakSchema],
    correct: { type: String, default: null },
    monthHours: { type: Number, default: 0 }
}, { versionKey: false });

CrewShiftMongoSchema.index({ table_num: 1, startShift: -1 });
CrewShiftMongoSchema.index({ shift_id: 1 });
CrewShiftMongoSchema.index({ startShift: 1 });

export const CrewShiftModel = mongoose.model<CrewShift>('CrewShift', CrewShiftMongoSchema, 'crew_shifts');