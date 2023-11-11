import { FC, ReactNode, useState } from 'react';
import ReactSplitPane, { Pane } from 'split-pane-react';
import { Divider } from 'components/divider';
import styled from 'styled-components';
import 'split-pane-react/esm/themes/default.css';

type SizesType = Array<string | number>;

type SplitPaneProps = {
  initialSizes: SizesType;
  minSizes: SizesType;
  renderLeft: () => ReactNode;
  renderRight: () => ReactNode;
  calcHeight: string;
};

const SASH_MARGIN = 16;

const Sash = styled.div`
  margin-top: ${SASH_MARGIN}px;
`;

export const SplitPane: FC<SplitPaneProps> = ({
  initialSizes,
  minSizes,
  renderLeft,
  renderRight,
  calcHeight,
}) => {
  const [sizes, setSizes] = useState<SizesType>(initialSizes);

  return (
    <ReactSplitPane
      split="vertical"
      sizes={sizes}
      onChange={setSizes}
      sashRender={() => (
        <Sash>
          <Divider height={`calc(${calcHeight} - ${SASH_MARGIN}px)`} />
        </Sash>
      )}
      allowResize
    >
      <Pane minSize={minSizes[0]}>{renderLeft()}</Pane>
      <Pane minSize={minSizes[1]}>{renderRight()}</Pane>
    </ReactSplitPane>
  );
};
