import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { TestPreviewList } from 'widgets/test-preview-list';
import { useCallback, FC } from 'react';
import { TestPreview } from 'domain/model/test-model';
import { useQaseTestId } from 'domain/hooks/params-hooks/use-qase-test-id';
import { TestDetails } from 'widgets/test-details';
import { Input } from 'components/input';
import { useFilteredTests } from 'domain/hooks/tests-hooks/use-filtered-tests';
import styled from 'styled-components';

const Wrapper = styled.div`
  box-sizing: border-box;
  height: 100%;
`;

const FiltersSlot = styled.div`
  margin-bottom: 18px;
`;

const forbiddenChars = /[#\/]/g;

export const ReportTestTabContent: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();
  const { search, setSearch, filteredTests } = useFilteredTests(tests);

  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);

  return (
    <>
      <FiltersSlot>
        <Input
          placeholder="Search"
          value={search}
          onChange={setSearch}
          forbidRegex={forbiddenChars}
        />
      </FiltersSlot>
      <Wrapper>
        <TestPreviewList
          tests={filteredTests}
          onTestSelect={handleTestSelection}
          activeTestId={activeTestId}
        />
      </Wrapper>
    </>
  );
};

export const ReportTestTabPanel: FC = () => {
  const [activeTestId] = useQaseTestId();
  return activeTestId ? <TestDetails qaseTestId={activeTestId} /> : null;
};
