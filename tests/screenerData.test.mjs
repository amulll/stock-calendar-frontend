import test from "node:test";
import assert from "node:assert/strict";

import { fetchScreenerData } from "../lib/screenerData.mjs";

test("successful empty response remains a legitimate empty result", async () => {
  const result = await fetchScreenerData({
    apiUrl: "https://example.test",
    serviceToken: "test",
    fetchImpl: async () => ({ ok: true, json: async () => [] }),
  });

  assert.deepEqual(result, { ok: true, rows: [], error: null });
});

test("non-200 and network errors are upstream failures", async () => {
  const non200 = await fetchScreenerData({
    apiUrl: "https://example.test",
    serviceToken: "test",
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });
  const networkFailure = await fetchScreenerData({
    apiUrl: "https://example.test",
    serviceToken: "test",
    fetchImpl: async () => {
      throw new Error("offline");
    },
  });
  const invalidResponse = await fetchScreenerData({
    apiUrl: "https://example.test",
    serviceToken: "test",
    fetchImpl: async () => ({ ok: true, json: async () => ({ rows: [] }) }),
  });

  assert.equal(non200.ok, false);
  assert.equal(networkFailure.ok, false);
  assert.equal(invalidResponse.ok, false);
  assert.deepEqual(non200.rows, []);
  assert.deepEqual(networkFailure.rows, []);
  assert.equal(invalidResponse.error, "invalid_response");
});
