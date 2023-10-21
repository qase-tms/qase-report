import { getTestPreviews, TestResults } from 'domain/api/get-test-preview';
import { useRequest } from 'domain/api/use-request';
import { TestPreview } from 'domain/model/test-model';

export const useTestPreviewList = ():TestPreview[] => {
    const { data } = useRequest<TestResults>(getTestPreviews);
    return data?.results ?? [];
};