import { createApiClient } from '../client';

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe('createApiClient', () => {
  it('posts missions and unwraps the result', async () => {
    const fetchFn = jest.fn(() =>
      json(200, {
        missions: [
          { id: 'a', pt: 4, judgement: { choice: 'level_2', probabilities: {}, confidence: 1 } },
        ],
      }),
    );
    const client = createApiClient(fetchFn, 'http://api');
    const result = await client.judgeMissions(500, [{ id: 'a', name: 'A', kind: 'daily' }]);

    expect(result).toEqual({
      ok: true,
      data: [
        { id: 'a', pt: 4, judgement: { choice: 'level_2', probabilities: {}, confidence: 1 } },
      ],
    });
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api/judge/missions',
      expect.objectContaining({ method: 'POST' }),
    );
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      budgetUsd: 500,
      missions: [{ id: 'a', name: 'A', kind: 'daily' }],
    });
  });

  it('reports a Jev failure', async () => {
    const client = createApiClient(() => json(502, { detail: 'jev_failed' }), 'http://api');
    expect(await client.judgeReward(500, 'x')).toEqual({ ok: false, error: 'jev_failed' });
  });

  it('reports an unreachable server', async () => {
    const client = createApiClient(
      () => Promise.reject(new TypeError('Failed to fetch')),
      'http://api',
    );
    expect(await client.judgeReward(500, 'x')).toEqual({ ok: false, error: 'network' });
  });
});
