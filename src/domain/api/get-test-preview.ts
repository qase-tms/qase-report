import { jsonpFetch } from 'utils/jsonp-fetch';
import { TestPreview } from 'domain/model/test';

export type TestResults = {
    results: TestPreview[]
};

const testResultsPath = 'qase-report-jsonp/report.jsonp';

export const getTestPreviews = ():Promise<TestResults> => {
    return jsonpFetch<TestResults>(testResultsPath);
}