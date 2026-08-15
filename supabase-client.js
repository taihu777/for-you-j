(function createSupabaseSubmissionModule() {
  const SUBMISSION_ID_UNIQUE_CONSTRAINT = 'submissions_submission_id_unique';
  const SUBMISSION_TIMEOUT_MS = 15000;

  function getConfig() {
    return window.SUPABASE_CONFIG || {};
  }

  function isConfigured() {
    const { url, publishableKey } = getConfig();
    const normalizedUrl = String(url || '').trim().replace(/\/$/, '');
    const normalizedKey = String(publishableKey || '').trim();

    return (
      /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(normalizedUrl) &&
      /^sb_publishable_[A-Za-z0-9_-]+$/.test(normalizedKey)
    );
  }

  function isSubmissionIdUniqueViolation(responseStatus, errorBody) {
    if (responseStatus !== 409 || errorBody?.code !== '23505') return false;

    const reportedConstraint =
      typeof errorBody.constraint === 'string' ? errorBody.constraint : '';
    const message = typeof errorBody.message === 'string' ? errorBody.message : '';
    const namesExpectedConstraint =
      reportedConstraint === SUBMISSION_ID_UNIQUE_CONSTRAINT ||
      message.includes(`"${SUBMISSION_ID_UNIQUE_CONSTRAINT}"`);

    return namesExpectedConstraint;
  }

  async function submitSubmission(
    payload,
    fetchImplementation = window.fetch.bind(window),
    options = {},
  ) {
    if (!isConfigured()) {
      const error = new Error('Submission is unavailable.');
      error.code = 'SUPABASE_NOT_CONFIGURED';
      throw error;
    }

    const { url, publishableKey } = getConfig();
    const endpoint = `${String(url).replace(/\/$/, '')}/rest/v1/submissions`;
    const requestedTimeout = Number(options.timeoutMs);
    const timeoutMs =
      Number.isFinite(requestedTimeout) && requestedTimeout > 0
        ? requestedTimeout
        : SUBMISSION_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    let response;

    try {
      response = await fetchImplementation(endpoint, {
        method: 'POST',
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      const error = new Error('Submission request did not complete.');
      error.code = controller.signal.aborted
        ? 'SUPABASE_REQUEST_TIMEOUT'
        : 'SUPABASE_NETWORK_ERROR';
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (response.ok) {
      return { ok: true, duplicate: false };
    }

    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch {
      // 非 JSON 错误仍按真实请求失败处理。
    }

    // 只有明确命中 submission_id 命名唯一约束的 23505 才代表同一提交已存在。
    if (isSubmissionIdUniqueViolation(response.status, errorBody)) {
      return { ok: true, duplicate: true };
    }

    const error = new Error('Submission request failed.');
    error.code = 'SUPABASE_REQUEST_FAILED';
    error.status = response.status;
    error.databaseCode = errorBody?.code || null;
    error.constraint = errorBody?.constraint || null;
    throw error;
  }

  window.DateInvitationSupabase = Object.freeze({
    SUBMISSION_ID_UNIQUE_CONSTRAINT,
    SUBMISSION_TIMEOUT_MS,
    isConfigured,
    isSubmissionIdUniqueViolation,
    submitSubmission,
  });
})();
