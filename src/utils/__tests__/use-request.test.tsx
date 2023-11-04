import { RequestStatus, useRequest } from 'utils/use-request';
import { renderHook, waitFor } from '@testing-library/react';

const mockData = { success: true };

describe('use-request', () => {
  it('on init returns null data, Loading status, undefined error', async () => {
    const request = (signal?: AbortSignal): Promise<typeof mockData> => {
      return new Promise(resolve => {
        resolve(mockData);
      });
    };
    const { result } = renderHook(() => useRequest<typeof mockData>(request, []));

    await waitFor(() => {
      expect(result.current.status).toBe(RequestStatus.Loading);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(undefined);
    });
  });

  it('on success returns mock data, Success status, undefined error', async () => {
    const request = (signal?: AbortSignal): Promise<typeof mockData> => {
      return new Promise(resolve => {
        resolve(mockData);
      });
    };
    const { result } = renderHook(() => useRequest<typeof mockData>(request, []));

    await waitFor(() => {
      expect(result.current.status).toBe(RequestStatus.Success);
      expect(result.current.data).toBe(mockData);
      expect(result.current.error).toBe(undefined);
    });
  });
});
