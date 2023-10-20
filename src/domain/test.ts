export enum TestStatus {
    Passed='passed',
    Failed='failed'
};

export type TestPreview = {
    id: string,
    title: string,
    status: TestStatus,
    duration: number,
    thread: string,
};

export type TestExecution = {
    start_time: number,
    status: TestStatus,
    end_time: number,
    duration: number,
    thread: string,
};

export type TestDetails = {
    id: string,
    title: string,
    execution: TestExecution
};