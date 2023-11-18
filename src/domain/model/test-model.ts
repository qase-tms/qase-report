export enum TestStatus {
  Passed = 'passed',
  Failed = 'failed',
  Skipped = 'skipped',
  Invalid = 'invalid',
}

export type TestPreview = {
  id: string;
  title: string;
  status: TestStatus;
  duration: number;
  thread: string;
};

export type TestExecution = {
  start_time: number;
  status: TestStatus;
  end_time: number;
  duration: number;
  thread?: string;
};

export type TestFields = {
  description?: string;
};

export type TestAttachment = {
  file_name: string;
  mime_type: string;
  file_path: string;
  id: string;
};

export type TestStep = {
  id: string;
  step_type: string;
  execution: TestExecution;
  parent_id: string | null;
  data: {
    action: string;
    expected_result: string | null;
  };
  attachments: TestAttachment[];
  steps: TestStep[];
};

export type Test = {
  id: string;
  title: string;
  execution: TestExecution;
  fields: TestFields;
  steps: TestStep[];
  attachments: TestAttachment[];
};
