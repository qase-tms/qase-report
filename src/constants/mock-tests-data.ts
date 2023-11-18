import { TestAttachment, TestPreview } from 'domain/model/test-model';

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
