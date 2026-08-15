(function createStorageModule() {
  const STORAGE_KEY = 'date-invitation:draft:v1';

  function loadState() {
    try {
      const rawDraft = window.localStorage.getItem(STORAGE_KEY);
      if (!rawDraft) return null;

      const parsedDraft = JSON.parse(rawDraft);
      return parsedDraft && typeof parsedDraft === 'object' ? parsedDraft : null;
    } catch {
      return null;
    }
  }

  function saveState(draft) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      return true;
    } catch {
      return false;
    }
  }

  function clearState() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  window.DateInvitationStorage = Object.freeze({
    STORAGE_KEY,
    loadState,
    saveState,
    clearState,
  });
})();
