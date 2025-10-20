// src/types.ts
export interface TaskExecution {
startTime: string; // ISO
endTime: string; // ISO
output: string;
}


export interface Task {
id: string;
name: string;
owner: string;
command: string;
taskExecutions: TaskExecution[];
}


export interface TaskStats {
 total: number;
 withRuns: number;
 uniqueOwners: number;
 totalRuns: number;
 lastRun: string | null;
}
