import { FC, useCallback, CSSProperties } from 'react';
import { TestPreviewItem } from 'widgets/test-preview-item';
import { TestDetails } from 'widgets/test-details';
import { TestPreview } from 'domain/model/test-model';
import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { SplitPane } from 'components/split-pane';
import { Layout, Panel } from './tests-layout-styled';
import { List, AutoSizer } from 'react-virtualized';

type RowProps = {
  key: string;
  style: CSSProperties;
  index: number;
};

export const TestsLayout: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();

  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);

  const itemRenderer = useCallback(
    ({ key, style, index }: RowProps) => {
      return (
        <div key={key} style={style}>
          <TestPreviewItem test={tests[index]} onSelect={handleTestSelection} />
        </div>
      );
    },
    [tests],
  );
  return (
    <Layout>
      <SplitPane
        initialSizes={['auto', '40%']}
        minSizes={['600px', '650px']}
        renderLeft={() => (
          <Panel>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  rowCount={tests.length}
                  rowHeight={53}
                  rowRenderer={itemRenderer}
                />
              )}
            </AutoSizer>
          </Panel>
        )}
        renderRight={() => activeTestId && <TestDetails qaseTestId={activeTestId} />}
      />
    </Layout>
  );
};
