import { jsonpFetch } from 'utils/jsonp/jsonp-fetch';
import { Test } from 'domain/model/test-model';

const testPath = (testId: string) => `qase-report-jsonp/results/${testId}.jsonp`;

export const getTest = (testId: string, signal?: AbortSignal):Promise<Test> => {
    return jsonpFetch<Test>(testPath(testId), signal);
}