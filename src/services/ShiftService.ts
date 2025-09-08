import { CrewShift, CurrentCrewShift, ShiftCorrectionDto } from "../model/CrewShift.js";

export interface ShiftService {

    startShift(table_num: string): Promise<{ table_num: string; time: number }>;

    finishShift(table_num: string): Promise<{ table_num: string; time: number }>;

    takeBreak(table_num: string, duration: 15 | 30): Promise<void>;

    correctShift(correction: ShiftCorrectionDto): Promise<void>;

    getCurrentShiftStaff(): Promise<CurrentCrewShift[]>;

    getActiveShiftByEmployee(table_num: string): Promise<CrewShift | null>;

    canStartShift(table_num: string): Promise<boolean>;
}