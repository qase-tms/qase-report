import { jsonpFetch } from 'utils/jsonp/jsonp-fetch';
import { TestPreview } from 'domain/model/test-model';

export type TestResults = {
  results: TestPreview[];
};

const testResultsPath = 'qase-report-jsonp/report.jsonp';

export const getTestPreviews = (signal?: AbortSignal): Promise<TestResults> => {
  return jsonpFetch<TestResults>(testResultsPath, signal);
};
