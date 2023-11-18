import { TestAttachment, TestPreview, Test, TestStep } from 'domain/model/test-model';

export const mockTestsData = [
  {
    id: '1b70a53e-b66e-4b79-8308-ecf8bfe86373',
    title: 'Test with multinested steps',
    status: 'failed',
    duration: 7,
    thread: '1398-MainThread',
  },
  {
    id: 'd6d3f266-3e21-4f70-a14d-27bbd01fa0ae',
    title: 'test_sum_odd_even_returns_odd',
    status: 'passed',
    duration: 0,
    thread: '1398-MainThread',
  },
] as TestPreview[];

export const mockAttachment = {
  file_name: 'sample.txt',
  mime_type: 'text/plain',
  file_path: './attachments/sample.txt',
  content: null,
  size: 11,
  id: 'abd58677-a7dc-4b5c-aee6-7fad047e7030',
} as TestAttachment;

export const mockStep = {
  id: '3b28e8a9-98b4-4edd-a8e5-6fd82b798eaf',
  step_type: 'text',
  data: {
    action: 'Simple step',
    expected_result: '125',
  },
  parent_id: null,
  execution: {
    start_time: 1691652628.651196,
    status: 'passed',
    end_time: 1691652628.6512089,
    duration: 0,
  },
  attachments: [mockAttachment],
  steps: [],
} as TestStep;

export const mockTest = {
  id: '15e9c820-5242-4b80-8f6c-47ad85d4fbfc',
  title: '#1 Test with successful steps',
  execution: {
    start_time: 1691652628.650742,
    status: 'passed',
    end_time: 1691652628.651354,
    duration: 0,
    thread: '50366-MainThread',
  },
  fields: {
    description: 'Some cool test with steps',
  },
  attachments: [mockAttachment],
  steps: [mockStep],
} as Test;

export const mockNestedSteps = [
  {
    id: 'b14c349a-5f45-459e-92f7-fae186e6def8',
    step_type: 'text',
    data: {
      action: 'Simple Nested step',
      expected_result: null,
    },
    parent_id: '67083c8c-ce4b-491c-acfc-901034e78d31',
    execution: {
      start_time: 1691652628.6728,
      status: 'failed',
      end_time: 1691652628.6728551,
      duration: 0,
    },
    attachments: [],
    steps: [
      {
        id: 'd1c3ed11-5fa6-4952-8d5a-c88ca5b5c63c',
        step_type: 'text',
        data: {
          action: 'Simple step',
          expected_result: null,
        },
        parent_id: 'b14c349a-5f45-459e-92f7-fae186e6def8',
        execution: {
          start_time: 1691652628.6728058,
          status: 'passed',
          end_time: 1691652628.672808,
          duration: 0,
        },
        attachments: [],
        steps: [],
      },
      {
        id: 'f905a0fe-61e6-4ad7-9d2b-78f997fb50ae',
        step_type: 'text',
        data: {
          action: 'Failing step',
          expected_result: null,
        },
        parent_id: 'b14c349a-5f45-459e-92f7-fae186e6def8',
        execution: {
          start_time: 1691652628.6728141,
          status: 'failed',
          end_time: 1691652628.6728508,
          duration: 0,
        },
        attachments: [],
        steps: [],
      },
    ],
  },
] as TestStep[];
