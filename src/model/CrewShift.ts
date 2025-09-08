export type Break = {
    start: number;
    end: number;
    duration: 15 | 30;
}

export type CrewShift = {
    _id?: string;
    shift_id: string;
    startShift: number;
    finishShift: number | null;
    table_num: string;
    shiftDuration: number;
    breaks: Break[];
    correct: string | null;
    monthHours: number;
}

export type CurrentCrewShift = CrewShift & {
    status: 'active' | 'finished';
    employeeInfo?: {
        firstName: string;
        lastName: string;
    }
}

export type ShiftStartDto = {
    table_num: string;
}

export type ShiftFinishDto = {
    table_num: string;
}

export type BreakDto = {
    table_num: string;
    duration: 15 | 30;
}

export type ShiftCorrectionDto = {
    table_num_crew: string;
    table_num_mng: string;
    start: number;
    finish: number;
    date: string;
}