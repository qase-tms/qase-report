import { TestAttachments, testIds } from '../test-attachments';
import { themedRender as render } from 'utils/test-utils';
import { mockAttachment } from 'constants/mock-tests-data';
import { screen } from '@testing-library/react';

describe('<TestAttachments />', () => {
  it('Renders test attachments', () => {
    const attachments = [mockAttachment];
    render(<TestAttachments attachments={attachments} />);
    expect(screen.getByTestId(testIds.getAttachmentLink(mockAttachment.id)).textContent).toBe(
      mockAttachment.file_name,
    );
  });
  it('Attachment link href is based on file_name and file_path', () => {
    const attachments = [mockAttachment];
    render(<TestAttachments attachments={attachments} />);
    const element = screen.getByTestId(
      testIds.getAttachmentLink(mockAttachment.id),
    ) as HTMLAnchorElement;
    expect(element.href).toContain(
      `qase-report-jsonp/attachments/${mockAttachment.id}-${mockAttachment.file_name}`,
    );
  });
});
