const card = document.querySelector('#card');
const stage = document.querySelector('.stage');

const mainActivityQuestion = {
  id: 'mainActivity',
  stateKey: 'primaryActivity',
  save: true,
  eyebrow: '先随便想一下',
  prompt: '如果真有半天空闲，\n你会想先做什么？',
  options: [
    { emoji: '🎬', label: '看电影', value: 'movie' },
    { emoji: '🍜', label: '找点东西吃', value: 'food' },
    { emoji: '🌿', label: '到处逛逛', value: 'walk' },
    { emoji: '☕', label: '找个地方坐坐', value: 'chat' },
  ],
};

const activityDetailQuestions = {
  movie: {
    id: 'moviePreference',
    stateKey: 'moviePreference',
    save: true,
    eyebrow: '那电影呢',
    prompt: '那你更想看哪一种？',
    options: [
      { emoji: '😆', label: '轻松一点的', description: '喜剧类', value: 'light' },
      {
        emoji: '🕵️',
        label: '有点悬念的',
        description: '悬疑 / 犯罪 / 剧情',
        value: 'mystery',
      },
      { emoji: '🎬', label: '刺激一点的', description: '动作 / 冒险', value: 'action' },
      {
        emoji: '✨',
        label: '有想象力一点的',
        description: '动画 / 奇幻',
        value: 'fantasy',
      },
      {
        emoji: '👀',
        label: '到时候看排片',
        description: '有什么合适就看什么',
        value: 'showtimes',
      },
    ],
  },
  food: {
    id: 'foodPreference',
    stateKey: 'foodPreference',
    save: true,
    eyebrow: '那吃的呢',
    prompt: '吃东西的话呢？',
    options: [
      { emoji: '🍚', label: '好好吃顿饭', value: 'meal' },
      { emoji: '🌶️', label: '吃点重口一点的', value: 'bold' },
      { emoji: '🍜', label: '面、小吃之类', value: 'snacks' },
      { emoji: '🥤', label: '喝点东西 / 吃点甜的', value: 'drinks' },
      { emoji: '👀', label: '到时候看附近有什么', value: 'nearby' },
    ],
  },
  walk: {
    id: 'walkPreference',
    stateKey: 'walkPreference',
    save: true,
    eyebrow: '那就随便走走',
    prompt: '那如果随便走走呢？',
    options: [
      { emoji: '🌿', label: '找个地方慢慢逛', value: 'slow' },
      { emoji: '🍢', label: '边走边找点吃的', value: 'snackWalk' },
      { emoji: '👀', label: '看见有意思的就停下来', value: 'stopAnywhere' },
      { emoji: '🚶', label: '没什么目的地也挺好', value: 'noDestination' },
    ],
  },
  chat: {
    id: 'chatPlacePreference',
    stateKey: 'chatPlacePreference',
    save: true,
    eyebrow: '找个地方坐坐',
    prompt: '那找个什么样的地方\n比较舒服？',
    options: [
      { emoji: '🌙', label: '安静一点', value: 'quiet' },
      { emoji: '🎵', label: '有点热闹也行', value: 'lively' },
      { emoji: '🥤', label: '奶茶 / 咖啡店', value: 'cafe' },
      { emoji: '🙂', label: '哪里舒服就哪里', value: 'comfortable' },
    ],
  },
};

const secondaryActivityOptions = {
  movie: ['food', 'walk', 'chat', 'none'],
  food: ['walk', 'chat', 'movie', 'none'],
  walk: ['food', 'chat', 'movie', 'none'],
  chat: ['walk', 'food', 'movie', 'none'],
};

const activityLabels = {
  movie: { emoji: '🎬', secondaryLabel: '看场电影' },
  food: { emoji: '🍜', secondaryLabel: '找点东西吃' },
  walk: { emoji: '🌿', secondaryLabel: '随便逛逛' },
  chat: { emoji: '☕', secondaryLabel: '找个地方坐坐' },
  none: { emoji: '👀', secondaryLabel: '到时候再说' },
};

const reflectionQuestions = {
  firstMeeting: {
    id: 'firstMeeting',
    sensitive: true,
    reviewLabel: '见面第一秒',
    eyebrow: '随便想象一下',
    prompt: '两个很久没见的人真的见面，',
    detail: '第一秒大概会怎么样？',
    options: [
      { emoji: '😶', label: '有点尴尬', value: 'awkward' },
      { emoji: '🙂', label: '应该挺自然', value: 'natural' },
      { emoji: '😂', label: '可能先笑出来', value: 'laugh' },
      { emoji: '🤷', label: '谁知道呢', value: 'unknown' },
    ],
    skippable: true,
  },
  afterNatural: {
    id: 'afterNatural',
    sensitive: true,
    reviewLabel: '如果相处得自然',
    eyebrow: '不过',
    prompt: '如果那天相处起来，\n比想象中自然一点……',
    options: [
      { emoji: '🙂', label: '那就挺好', value: 'good' },
      { emoji: '↗', label: '下次也可以', value: 'nextTime' },
      { emoji: '✋', label: '先别想那么远', value: 'notYet' },
      { emoji: '☁️', label: '到时候再说', value: 'later' },
    ],
    skippable: true,
  },
};

const statementScreens = {
  realityCheck: {
    title: '谁知道呢。',
    detail: '真见到了，\n可能和想的都不一样。',
  },
};

const closingScreens = {
  closingThought: '好像想得有点多了。',
  closingUnknown: '毕竟现在，\n连什么时候能见面都不知道。',
  closingIf: '所以这些，\n就先留在“如果”里。',
};

const screenFlow = [
  { id: 'opening', kind: 'opening' },
  { id: 'mainActivity', kind: 'question' },
  { id: 'mainDetail', kind: 'question' },
  { id: 'secondActivity', kind: 'question' },
  { id: 'secondDetail', kind: 'question' },
  { id: 'transition', kind: 'transition' },
  { id: 'firstMeeting', kind: 'question' },
  { id: 'realityCheck', kind: 'statement' },
  { id: 'afterNatural', kind: 'question' },
  { id: 'closingThought', kind: 'closing' },
  { id: 'closingUnknown', kind: 'closing' },
  { id: 'closingIf', kind: 'closing' },
  { id: 'invitation', kind: 'invitation' },
  { id: 'review', kind: 'review' },
];

const preferenceStateKeys = [
  'moviePreference',
  'foodPreference',
  'walkPreference',
  'chatPlacePreference',
];

function createInitialState() {
  return {
    screenIndex: 0,
    primaryActivity: null,

    // null = 用户尚未回答第二活动问题
    // 'none' = 用户已经明确选择“到时候再说”，不安排第二活动
    secondaryActivity: null,

    moviePreference: null,
    foodPreference: null,
    walkPreference: null,
    chatPlacePreference: null,

    questions: Object.fromEntries(
      Object.keys(reflectionQuestions).map((questionId) => [
        questionId,
        { answer: null, share: false },
      ]),
    ),
    invitationResponse: null,
    submissionId: null,
    submitted: false,

    noCount: 0,
    noSettling: false,
    transitioning: false,
    submissionPending: false,
    submissionError: '',
  };
}

function hasOptionValue(question, value) {
  return question?.options.some((option) => option.value === value) ?? false;
}

function sanitizeStoredDraft(draft) {
  const restored = createInitialState();
  if (!draft || typeof draft !== 'object') return restored;

  const primaryActivityValues = mainActivityQuestion.options.map((option) => option.value);
  if (primaryActivityValues.includes(draft.primaryActivity)) {
    restored.primaryActivity = draft.primaryActivity;
  }

  const validSecondaryValues = restored.primaryActivity
    ? secondaryActivityOptions[restored.primaryActivity]
    : [];
  if (validSecondaryValues.includes(draft.secondaryActivity)) {
    restored.secondaryActivity = draft.secondaryActivity;
  }

  preferenceStateKeys.forEach((stateKey) => {
    const question = Object.values(activityDetailQuestions).find(
      (candidate) => candidate.stateKey === stateKey,
    );
    if (hasOptionValue(question, draft[stateKey])) {
      restored[stateKey] = draft[stateKey];
    }
  });

  Object.entries(reflectionQuestions).forEach(([questionId, question]) => {
    const storedQuestion = draft.questions?.[questionId];
    if (!storedQuestion || typeof storedQuestion !== 'object') return;

    restored.questions[questionId] = {
      answer: hasOptionValue(question, storedQuestion.answer) ? storedQuestion.answer : null,
      share: storedQuestion.share === true,
    };
  });

  if (draft.invitationResponse === 'maybeYes' || draft.invitationResponse === 'later') {
    restored.invitationResponse = draft.invitationResponse;
  }

  if (
    typeof draft.submissionId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      draft.submissionId,
    )
  ) {
    restored.submissionId = draft.submissionId;
  }

  restored.submitted =
    draft.submitted === true &&
    Boolean(restored.submissionId) &&
    Boolean(restored.invitationResponse);

  const restoredScreenIndex = screenFlow.findIndex((screen) => screen.id === draft.screenId);
  if (restoredScreenIndex >= 0) restored.screenIndex = restoredScreenIndex;
  if (screenFlow[restored.screenIndex]?.id === 'review' && !restored.invitationResponse) {
    restored.screenIndex = indexOfScreen('invitation');
  }
  if (restored.submitted) restored.screenIndex = indexOfScreen('review');

  return restored;
}

const state = sanitizeStoredDraft(window.DateInvitationStorage?.loadState());

const noMoves = [
  { x: 26, y: -6, label: '差一点' },
  { x: -30, y: 7, label: '又差一点' },
  { x: 22, y: -4, label: '算了' },
];

const pageAsides = {
  mainActivity: '按第一感觉选就好。',
  firstMeeting: '这一题不用想太久。',
  afterNatural: '其实没有标准答案。',
};

const stageNotes = {
  transition: '已经走了一半啦。',
  closingIf: '差一点就到最后了。',
};

const microReactionCopies = {
  mainActivity: {
    movie: '原来是这个。',
    food: '好，记住了。',
    walk: '嗯，慢慢走。',
    chat: '这个也很好。',
  },
  firstMeeting: '好像知道一点了。',
  afterNatural: '收到啦。',
};

const endingCopies = {
  movie: '那我先偷偷期待一下那场电影。',
  food: '那看来得认真挑一家好吃的了。',
  walk: '那就留一点时间，慢慢走。',
  chat: '那我应该准备好多听一点。',
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let microReactionTimers = [];
let successEpilogueTimers = [];
let easterEggTapCount = 0;
let easterEggResetTimer = null;
let easterEggRevealed = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatText(value) {
  return escapeHtml(value).replaceAll('\n', '<br />');
}

function clearTimers(timers) {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers.length = 0;
}

function showMicroReaction(questionId, value) {
  const configuredCopy = microReactionCopies[questionId];
  const copy =
    typeof configuredCopy === 'string' ? configuredCopy : configuredCopy?.[value] || '';
  if (!copy || !stage) return;

  clearTimers(microReactionTimers);
  stage.querySelector('.micro-reaction')?.remove();

  const reaction = document.createElement('p');
  reaction.className = 'micro-reaction';
  reaction.textContent = copy;
  reaction.setAttribute('aria-hidden', 'true');
  stage.append(reaction);

  if (reduceMotion.matches) {
    reaction.classList.add('is-visible');
    microReactionTimers.push(window.setTimeout(() => reaction.remove(), 1200));
    return;
  }

  requestAnimationFrame(() => reaction.classList.add('is-visible'));
  microReactionTimers.push(
    window.setTimeout(() => reaction.classList.remove('is-visible'), 1000),
    window.setTimeout(() => reaction.remove(), 1550),
  );
}

function showPageAside(screenId) {
  const copy = pageAsides[screenId];
  const header = card.querySelector('.question-header');
  if (!copy || !header) return;

  const aside = document.createElement('p');
  aside.className = 'page-aside';
  aside.textContent = copy;
  header.append(aside);
}

function showStageNote(screenId) {
  const copy = stageNotes[screenId];
  const action = card.querySelector('.single-action');
  if (!copy || !action) return;

  const note = document.createElement('p');
  note.className = 'stage-note';
  note.textContent = copy;
  action.before(note);
}

function getEndingCopy(activity) {
  return endingCopies[activity] || '那就先把这次认真地收好。';
}

function clearSuccessEpilogueTimers() {
  clearTimers(successEpilogueTimers);
}

function showSuccessEpilogue() {
  const epilogue = card.querySelector('.success-epilogue');
  if (!epilogue) return;

  const firstLine = epilogue.querySelector('.success-epilogue-first');
  const secondLine = epilogue.querySelector('.success-epilogue-second');
  if (reduceMotion.matches) {
    firstLine?.classList.add('is-visible');
    secondLine?.classList.add('is-visible');
    return;
  }

  successEpilogueTimers.push(
    window.setTimeout(() => firstLine?.classList.add('is-visible'), 3400),
    window.setTimeout(() => secondLine?.classList.add('is-visible'), 5900),
  );
}

function triggerEasterEgg() {
  if (easterEggRevealed || !stage) return;

  window.clearTimeout(easterEggResetTimer);
  easterEggTapCount += 1;
  if (easterEggTapCount < 5) {
    easterEggResetTimer = window.setTimeout(() => {
      easterEggTapCount = 0;
    }, 2400);
    return;
  }

  easterEggRevealed = true;
  const message = document.createElement('div');
  message.className = 'easter-egg-copy';
  message.setAttribute('aria-live', 'polite');
  message.innerHTML = `
    <p class="easter-egg-first">你居然真的发现这里了。</p>
    <p class="easter-egg-second">好吧，这句话本来就是留给你的。</p>
  `;
  stage.append(message);

  const firstLine = message.querySelector('.easter-egg-first');
  const secondLine = message.querySelector('.easter-egg-second');
  requestAnimationFrame(() => firstLine?.classList.add('is-visible'));
  window.setTimeout(
    () => secondLine?.classList.add('is-visible'),
    reduceMotion.matches ? 0 : 2200,
  );
  window.setTimeout(() => message.remove(), reduceMotion.matches ? 5000 : 7800);
}

function bindEasterEgg() {
  document.querySelector('.botanical-left')?.addEventListener('click', triggerEasterEgg);
}

function showSubmitFeedback(event) {
  const button = event.currentTarget;
  button.classList.add('is-soft-confirming');
  window.setTimeout(() => button.classList.remove('is-soft-confirming'), 420);
}

function indexOfScreen(id) {
  return screenFlow.findIndex((screen) => screen.id === id);
}

function getCurrentScreen() {
  return screenFlow[state.screenIndex];
}

function getActivePreferenceSnapshot(sourceState) {
  const activePreferences = Object.fromEntries(
    preferenceStateKeys.map((stateKey) => [stateKey, null]),
  );

  [sourceState.primaryActivity, sourceState.secondaryActivity].forEach((activity) => {
    const stateKey = activityDetailQuestions[activity]?.stateKey;
    if (stateKey) activePreferences[stateKey] = sourceState[stateKey] ?? null;
  });

  return activePreferences;
}

function createDraftSnapshot(sourceState = state) {
  const screenId =
    screenFlow[sourceState.screenIndex]?.id || (sourceState.submitted ? 'review' : 'opening');

  if (sourceState.submitted) {
    return {
      version: 1,
      screenId: 'review',
      primaryActivity: sourceState.primaryActivity,
      secondaryActivity: sourceState.secondaryActivity,
      ...getActivePreferenceSnapshot(sourceState),
      invitationResponse: sourceState.invitationResponse,
      submissionId: sourceState.submissionId,
      submitted: true,
    };
  }

  return {
    version: 1,
    screenId,
    primaryActivity: sourceState.primaryActivity,
    secondaryActivity: sourceState.secondaryActivity,
    moviePreference: sourceState.moviePreference,
    foodPreference: sourceState.foodPreference,
    walkPreference: sourceState.walkPreference,
    chatPlacePreference: sourceState.chatPlacePreference,
    questions: Object.fromEntries(
      Object.entries(sourceState.questions || {}).map(([questionId, questionState]) => [
        questionId,
        {
          answer: questionState.answer,
          share: questionState.share === true,
        },
      ]),
    ),
    invitationResponse: sourceState.invitationResponse,
    submissionId: sourceState.submissionId,
    submitted: false,
  };
}

function saveState() {
  return window.DateInvitationStorage?.saveState(createDraftSnapshot()) ?? false;
}

function loadState() {
  return window.DateInvitationStorage?.loadState() ?? null;
}

function clearState() {
  return window.DateInvitationStorage?.clearState() ?? false;
}

function setQuestionAnswer(questionId, answer) {
  if (!state.questions[questionId]) return;
  state.questions[questionId].answer = answer || null;
  saveState();
}

function setQuestionShare(questionId, share) {
  if (!state.questions[questionId] || state.submitted) return;
  state.questions[questionId].share = share === true;
  saveState();
}

function getOptionLabel(question, value) {
  return question?.options.find((option) => option.value === value)?.label || '';
}

function getActivitySummary(activity, sourceState = state) {
  if (!activity || activity === 'none') return null;
  const detailQuestion = activityDetailQuestions[activity];
  const preference = detailQuestion ? sourceState[detailQuestion.stateKey] : null;

  return {
    activity,
    activity_label:
      mainActivityQuestion.options.find((option) => option.value === activity)?.label ||
      activityLabels[activity]?.secondaryLabel ||
      activity,
    preference,
    preference_label: getOptionLabel(detailQuestion, preference) || null,
  };
}

function buildSubmissionPayload(sourceState = state) {
  if (!sourceState.submissionId) {
    throw new Error('缺少 submission_id，不能构造提交数据。');
  }

  const primaryActivity = getActivitySummary(sourceState.primaryActivity, sourceState);
  const secondaryActivity = getActivitySummary(sourceState.secondaryActivity, sourceState);
  if (!primaryActivity?.preference || !sourceState.invitationResponse) {
    throw new Error('主活动结果尚未完成，不能构造提交数据。');
  }
  if (sourceState.secondaryActivity !== 'none' && !secondaryActivity?.preference) {
    throw new Error('第二活动结果尚未完成，不能构造提交数据。');
  }

  const sharedAnswers = {};

  Object.entries(reflectionQuestions).forEach(([questionId, question]) => {
    const questionState = sourceState.questions?.[questionId];
    if (!questionState?.share || !questionState.answer) return;

    const answer = getOptionLabel(question, questionState.answer).trim();
    if (!answer) return;

    sharedAnswers[questionId] = { answer };
  });

  return {
    submission_id: sourceState.submissionId,
    main_activity: {
      primary_activity: primaryActivity,
      secondary_activity: secondaryActivity,
      invitation_response: sourceState.invitationResponse,
    },
    shared_answers: sharedAnswers,
  };
}

function createSubmissionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();

  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}

function ensureSubmissionId() {
  if (!state.submissionId) {
    state.submissionId = createSubmissionId();
    saveState();
  }
  return state.submissionId;
}

window.buildSubmissionPayload = buildSubmissionPayload;
window.createDraftSnapshot = createDraftSnapshot;

function getSecondaryActivityQuestion(primaryActivity) {
  const optionOrder = secondaryActivityOptions[primaryActivity];
  if (!optionOrder) return null;

  return {
    id: 'secondActivity',
    stateKey: 'secondaryActivity',
    save: true,
    eyebrow: '',
    prompt: '如果时间还早，\n接下来呢？',
    options: optionOrder.map((value) => ({
      ...activityLabels[value],
      label: activityLabels[value].secondaryLabel,
      value,
    })),
  };
}

function getQuestion(screen) {
  switch (screen.id) {
    case 'mainActivity':
      return mainActivityQuestion;
    case 'mainDetail':
      return activityDetailQuestions[state.primaryActivity];
    case 'secondActivity':
      return getSecondaryActivityQuestion(state.primaryActivity);
    case 'secondDetail':
      return activityDetailQuestions[state.secondaryActivity];
    case 'firstMeeting':
      return reflectionQuestions.firstMeeting;
    case 'afterNatural':
      return reflectionQuestions.afterNatural;
    default:
      return null;
  }
}

function getNextScreenIndex() {
  const currentScreen = getCurrentScreen();

  if (currentScreen.id === 'secondActivity') {
    if (state.secondaryActivity === null) return state.screenIndex;
    if (state.secondaryActivity === 'none') return indexOfScreen('transition');
  }

  return Math.min(state.screenIndex + 1, screenFlow.length - 1);
}

function render() {
  const screen = getCurrentScreen();
  card.className = 'invitation-card';
  card.dataset.screen = screen.kind;
  card.tabIndex = -1;

  if (screen.kind === 'opening') renderOpening();
  if (screen.kind === 'question') renderQuestion(getQuestion(screen), screen);
  if (screen.kind === 'transition') renderTransition();
  if (screen.kind === 'statement') renderStatement(screen);
  if (screen.kind === 'closing') renderClosing(screen);
  if (screen.kind === 'invitation') renderInvitation();
  if (screen.kind === 'review') renderReview();

  showPageAside(screen.id);
  showStageNote(screen.id);

  card.classList.remove('is-entering', 'is-leaving');
  requestAnimationFrame(() => card.classList.add('is-entering'));
}

function advance(delay = 260, preExitDelay = 0) {
  if (state.transitioning) return;
  state.transitioning = true;
  disableCurrentButtons();

  const beginExit = () => {
    card.classList.remove('is-entering');
    card.classList.add('is-leaving');
  };

  if (preExitDelay > 0) {
    window.setTimeout(beginExit, preExitDelay);
  } else {
    beginExit();
  }

  window.setTimeout(() => {
    state.screenIndex = getNextScreenIndex();
    state.transitioning = false;
    saveState();
    render();
    card.focus({ preventScroll: true });
  }, delay);
}

function disableCurrentButtons() {
  card.querySelectorAll('button').forEach((button) => {
    button.disabled = true;
  });
}

function renderOpening() {
  card.classList.add('opening-card');
  card.innerHTML = `
    <div class="sprig-mark" aria-hidden="true"><i></i><i></i><i></i></div>
    <p class="eyebrow">先卖个关子</p>
    <h1 class="title">有个东西想给你看看。</h1>
    <p class="subtitle">大概两分钟。</p>
    <figure class="dog-stamp" aria-label="一只歪着出现的小狗">
      <img src="assets/dog-avatar.png" alt="可爱的小狗" />
    </figure>
    <div class="opening-actions">
      <button class="paper-button primary wide" id="startButton" type="button">看看 👀</button>
      <button class="paper-button secondary no-button" id="noButton" type="button">算了</button>
      <p class="no-note" id="noNote" aria-live="polite"></p>
    </div>
  `;

  card.querySelector('#startButton').addEventListener('click', () => advance());
  const noButton = card.querySelector('#noButton');
  noButton.addEventListener('pointerenter', handleNoHover);
  noButton.addEventListener('click', handleNoClick);
}

function handleNoHover(event) {
  if (event.pointerType === 'touch' || state.noCount >= noMoves.length || state.noSettling) return;
  dodgeNoButton(event.currentTarget);
}

function handleNoClick(event) {
  if (state.noCount < noMoves.length) {
    event.preventDefault();
    dodgeNoButton(event.currentTarget);
    return;
  }

  if (!state.noSettling) showOutcome('decline');
}

function dodgeNoButton(button) {
  if (state.noCount >= noMoves.length || state.noSettling) return;
  const move = noMoves[state.noCount];
  const horizontalRoom = Math.max(0, (button.parentElement.clientWidth - button.offsetWidth) / 2 - 6);
  const safeX = Math.max(-horizontalRoom, Math.min(horizontalRoom, move.x));

  button.style.translate = `${safeX}px ${move.y}px`;
  button.textContent = move.label;
  state.noCount += 1;

  if (state.noCount === noMoves.length) {
    state.noSettling = true;
    button.disabled = true;

    window.setTimeout(() => {
      button.style.translate = '0 0';
      button.textContent = '算了';
      button.classList.add('is-settled');
      button.disabled = false;
      state.noSettling = false;
      card.querySelector('#noNote').textContent = '好啦，这次不跑了。';
    }, 260);
  }
}

function recoverFromMissingQuestion(screen) {
  if (screen.id === 'mainDetail' || screen.id === 'secondActivity') {
    state.screenIndex = indexOfScreen('mainActivity');
  } else if (screen.id === 'secondDetail') {
    state.screenIndex = indexOfScreen('secondActivity');
  }
  saveState();
  render();
}

function renderShareControl(question) {
  const questionState = state.questions[question.id];
  const isShared = questionState?.share === true;

  return `
    <div class="share-control" data-question-id="${escapeHtml(question.id)}">
      <p class="share-prompt">愿意让我看到这个答案吗？</p>
      <div class="share-choices" role="group" aria-label="这个答案的分享范围">
        <button
          class="share-choice${isShared ? '' : ' is-selected'}"
          type="button"
          data-share="false"
          aria-pressed="${isShared ? 'false' : 'true'}"
        >🔒 只留给自己</button>
        <button
          class="share-choice${isShared ? ' is-selected' : ''}"
          type="button"
          data-share="true"
          aria-pressed="${isShared ? 'true' : 'false'}"
        >♡ 愿意让我看到</button>
      </div>
    </div>
  `;
}

function syncShareControl(questionId) {
  const shareControl = card.querySelector(`[data-question-id="${questionId}"]`);
  if (!shareControl) return;

  const isShared = state.questions[questionId]?.share === true;
  shareControl.querySelectorAll('.share-choice').forEach((button) => {
    const isSelected = (button.dataset.share === 'true') === isShared;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

function renderQuestion(question, screen) {
  if (!question) {
    recoverFromMissingQuestion(screen);
    return;
  }

  card.classList.add('question-card');
  if (screen.id === 'mainDetail' || screen.id === 'secondDetail') {
    card.classList.add('detail-question-card');
  }

  const hasDescriptions = question.options.some((option) => option.description);
  const gridClasses = [
    'option-grid',
    question.options.length > 4 ? 'option-grid-dense' : '',
    hasDescriptions ? 'option-grid-branch' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const selectedValue = question.sensitive
    ? state.questions[question.id]?.answer
    : question.stateKey
      ? state[question.stateKey]
      : null;

  card.innerHTML = `
    <header class="question-header">
      ${question.eyebrow ? `<p class="eyebrow">${escapeHtml(question.eyebrow)}</p>` : ''}
      <h1 class="title question-title">${formatText(question.prompt)}</h1>
      ${question.detail ? `<p class="subtitle question-detail">${escapeHtml(question.detail)}</p>` : ''}
    </header>
    ${question.sensitive ? renderShareControl(question) : ''}
    <div class="${gridClasses}" role="group" aria-label="${escapeHtml(
      question.detail || question.prompt.replaceAll('\n', ''),
    )}">
      ${question.options
        .map((option, index) =>
          renderOption(option, index, question.options.length, selectedValue),
        )
        .join('')}
    </div>
    ${question.skippable ? '<button class="skip-button" id="skipButton" type="button">跳过</button>' : ''}
  `;

  card.querySelectorAll('.option-card').forEach((button) => {
    button.addEventListener('click', () => selectOption(question, button));
  });
  card.querySelectorAll('.share-choice').forEach((button) => {
    button.addEventListener('click', () => {
      setQuestionShare(question.id, button.dataset.share === 'true');
      syncShareControl(question.id);
    });
  });
  card.querySelector('#skipButton')?.addEventListener('click', () => {
    if (question.sensitive) {
      setQuestionAnswer(question.id, null);
      setQuestionShare(question.id, false);
    }
    advance();
  });
}

function renderOption(option, index, optionCount, selectedValue = null) {
  const isWide = optionCount === 5 && index === optionCount - 1;
  const isSelected = option.value === selectedValue;
  return `
    <button
      class="option-card${isWide ? ' option-card-wide' : ''}${
        isSelected ? ' is-selected' : ''
      }"
      type="button"
      data-value="${escapeHtml(option.value || option.label)}"
      aria-pressed="${isSelected ? 'true' : 'false'}"
    >
      <span class="option-emoji" aria-hidden="true">${option.emoji}</span>
      <span class="option-copy">
        <strong>${escapeHtml(option.label)}</strong>
        ${option.description ? `<small>${escapeHtml(option.description)}</small>` : ''}
      </span>
    </button>
  `;
}

function selectOption(question, button) {
  if (state.transitioning) return;

  card.querySelectorAll('.option-card').forEach((option) => {
    option.disabled = true;
    option.classList.toggle('is-selected', option === button);
    option.setAttribute('aria-pressed', String(option === button));
  });

  if (question.sensitive) {
    setQuestionAnswer(question.id, button.dataset.value);
  } else if (question.save) {
    if (question.stateKey === 'primaryActivity') {
      state.secondaryActivity = null;
      preferenceStateKeys.forEach((key) => {
        state[key] = null;
      });
    }
    state[question.stateKey] = button.dataset.value;
    saveState();
  }

  showMicroReaction(question.id, button.dataset.value);
  advance(360, 110);
}

function renderTransition() {
  card.classList.add('transition-card');
  card.innerHTML = `
    <div class="sprig-mark tall" aria-hidden="true"><i></i><i></i><i></i></div>
    <p class="eyebrow">嗯，</p>
    <h1 class="title">好像有点画面了。</h1>
    <div class="abstract-scene" aria-hidden="true">
      <span class="abstract-route route-one"></span>
      <span class="abstract-route route-two"></span>
      <span class="abstract-dot dot-one"></span>
      <span class="abstract-dot dot-two"></span>
      <span class="abstract-paper"></span>
      <span class="abstract-leaf leaf-one"></span>
      <span class="abstract-leaf leaf-two"></span>
      <span class="abstract-leaf leaf-three"></span>
    </div>
    <button class="paper-button primary wide single-action" id="continueButton" type="button">继续</button>
  `;

  card.querySelector('#continueButton').addEventListener('click', () => advance());
}

function renderStatement(screen) {
  const statement = statementScreens[screen.id];
  card.classList.add('statement-card');
  card.innerHTML = `
    <div class="sprig-mark tall" aria-hidden="true"><i></i><i></i><i></i></div>
    <h1 class="title">${escapeHtml(statement.title)}</h1>
    <p class="subtitle">${formatText(statement.detail)}</p>
    <button class="paper-button primary wide single-action" id="statementContinue" type="button">继续</button>
  `;

  card.querySelector('#statementContinue').addEventListener('click', () => advance(320));
}

function renderClosing(screen) {
  card.classList.add('closing-card');
  card.innerHTML = `
    <div class="sprig-mark tall" aria-hidden="true"><i></i><i></i><i></i></div>
    <h1 class="title">${formatText(closingScreens[screen.id])}</h1>
    <button class="paper-button primary wide single-action" id="closingContinue" type="button">继续</button>
  `;

  card.querySelector('#closingContinue').addEventListener('click', () => advance(340));
}

function renderInvitation() {
  card.classList.add('finale-card', 'invitation-choice-card');
  card.innerHTML = `
    <div class="invitation-question">
      <p class="subtitle invitation-lead">不过如果哪天真的都有空……</p>
      <h1 class="title">要不要一起出去走走？</h1>
    </div>
    <div class="final-choice-actions">
      <button class="paper-button primary wide" id="maybeYes" type="button">可以啊</button>
      <button class="paper-button secondary wide" id="later" type="button">到时候再说</button>
    </div>
    <figure class="dog-stamp corner-stamp" aria-hidden="true">
      <img src="assets/dog-avatar.png" alt="" />
    </figure>
  `;

  card.querySelector('#maybeYes').addEventListener('click', () => openReview('maybeYes'));
  card.querySelector('#later').addEventListener('click', () => openReview('later'));
}

function getInvitationResponseLabel(response) {
  return response === 'maybeYes' ? '可以啊' : '到时候再说';
}

function formatActivityReview(summary) {
  if (!summary) return '';
  return [summary.activity_label, summary.preference_label].filter(Boolean).join(' · ');
}

function renderReviewAnswerRow(questionId, isShared) {
  const question = reflectionQuestions[questionId];
  const questionState = state.questions[questionId];
  const answerLabel = getOptionLabel(question, questionState.answer);
  const toggleLabel = isShared ? '改为只留给自己' : '愿意让我看到';

  return `
    <div class="review-answer-row${isShared ? ' is-shared' : ' is-private'}">
      <div class="review-answer-copy">
        <strong>${isShared ? '✓' : '🔒'} ${escapeHtml(question.reviewLabel)}</strong>
        ${isShared ? `<span>${escapeHtml(answerLabel)}</span>` : ''}
      </div>
      ${
        state.submitted
          ? ''
          : `<button
              class="review-share-toggle"
              type="button"
              data-question-id="${escapeHtml(questionId)}"
              data-next-share="${isShared ? 'false' : 'true'}"
            >${escapeHtml(toggleLabel)}</button>`
      }
    </div>
  `;
}

function renderReview() {
  clearSuccessEpilogueTimers();
  ensureSubmissionId();
  card.classList.add('review-card');

  const primarySummary = getActivitySummary(state.primaryActivity);
  const secondarySummary = getActivitySummary(state.secondaryActivity);
  const answeredQuestionIds = Object.keys(reflectionQuestions).filter(
    (questionId) => state.questions[questionId]?.answer,
  );
  const sharedQuestionIds = answeredQuestionIds.filter(
    (questionId) => state.questions[questionId].share,
  );
  const privateQuestionIds = answeredQuestionIds.filter(
    (questionId) => !state.questions[questionId].share,
  );

  card.innerHTML = `
    <header class="review-header">
      <p class="eyebrow">最后确认一下</p>
      <h1 class="title review-title">这些内容要发给我吗？</h1>
      <p class="review-privacy-note">确认前都只保存在这台设备里。带锁的答案不会出现在发送内容中。</p>
    </header>

    <div class="review-sections">
      <section class="review-section" aria-labelledby="sharedReviewTitle">
        <div class="review-section-heading">
          <h2 id="sharedReviewTitle">你准备告诉我的</h2>
          <span>会发送</span>
        </div>
        <p class="review-section-intro">下面这些，是你最后决定让我知道的。</p>
        <div class="review-main-result">
          <strong>✓ 主活动结果</strong>
          <span>${escapeHtml(formatActivityReview(primarySummary))}</span>
          <span>${
            secondarySummary
              ? escapeHtml(`接下来：${formatActivityReview(secondarySummary)}`)
              : '接下来：到时候再说'
          }</span>
          <span>邀请回答：${escapeHtml(
            getInvitationResponseLabel(state.invitationResponse),
          )}</span>
        </div>
        ${
          sharedQuestionIds.length
            ? sharedQuestionIds
                .map((questionId) => renderReviewAnswerRow(questionId, true))
                .join('')
            : '<p class="review-empty">目前没有额外分享的答案。</p>'
        }
      </section>

      <section class="review-section review-private-section" aria-labelledby="privateReviewTitle">
        <div class="review-section-heading">
          <h2 id="privateReviewTitle">只留给你的内容</h2>
          <span>不会发送</span>
        </div>
        <p class="review-section-intro">剩下的，就留在这里。</p>
        ${
          privateQuestionIds.length
            ? privateQuestionIds
                .map((questionId) => renderReviewAnswerRow(questionId, false))
                .join('')
            : '<p class="review-empty">没有只留给自己的已回答内容。</p>'
        }
        <p class="review-skip-note">跳过或没有作答的问题也不会发送。</p>
      </section>
    </div>

    <p class="submission-status${state.submitted ? ' is-success' : ''}" id="submissionStatus" role="status">
      ${state.submitted ? '已经发送 ♡' : escapeHtml(state.submissionError)}
    </p>

    ${
      state.submitted
        ? `<p class="submitted-note">这份本地确认状态会保留，刷新页面不会重复发送。</p>
          <p class="ending-copy">${escapeHtml(getEndingCopy(state.primaryActivity))}</p>
          <button class="restart-button" id="restartInvitation" type="button">重新填写一次</button>
          <div class="success-epilogue" aria-live="off">
            <p class="success-epilogue-first">谢谢你认真走到这里。</p>
            <p class="success-epilogue-second">这大概就是我做这个网页最想看到的画面。</p>
          </div>`
        : `<div class="review-actions">
            <button class="paper-button primary wide" id="confirmSubmit" type="button">确认发送</button>
            <button class="paper-button secondary wide" id="backToAnswers" type="button">返回修改答案</button>
          </div>`
    }
  `;

  card.querySelectorAll('.review-share-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      setQuestionShare(button.dataset.questionId, button.dataset.nextShare === 'true');
      state.submissionError = '';
      renderReview();
    });
  });
  const confirmButton = card.querySelector('#confirmSubmit');
  confirmButton?.addEventListener('click', showSubmitFeedback);
  confirmButton?.addEventListener('click', submitFinalAnswers);
  card.querySelector('#backToAnswers')?.addEventListener('click', returnToAnswers);
  card.querySelector('#restartInvitation')?.addEventListener('click', restartInvitation);
  if (state.submitted) showSuccessEpilogue();
}

function restartInvitation() {
  const shouldRestart = window.confirm(
    '重新开始后，会清除这台设备上的本地填写记录。已经发送给我的内容不会被删除。确定要重新填写吗？',
  );
  if (!shouldRestart) return;

  localStorage.removeItem('date-invitation:draft:v1');
  window.location.reload();
}

function openReview(invitationResponse) {
  if (state.transitioning) return;
  state.invitationResponse = invitationResponse;
  ensureSubmissionId();
  saveState();
  advance(300);
}

function returnToAnswers() {
  if (state.transitioning || state.submitted) return;
  state.transitioning = true;
  disableCurrentButtons();
  card.classList.add('is-leaving');

  window.setTimeout(() => {
    state.screenIndex = indexOfScreen('firstMeeting');
    state.transitioning = false;
    state.submissionError = '';
    saveState();
    render();
    card.focus({ preventScroll: true });
  }, 240);
}

async function submitFinalAnswers() {
  if (state.submissionPending || state.submitted) return;

  const submitButton = card.querySelector('#confirmSubmit');
  const status = card.querySelector('#submissionStatus');
  state.submissionPending = true;
  state.submissionError = '';
  submitButton.disabled = true;
  submitButton.textContent = '正在发送…';
  status.textContent = '';

  try {
    const payload = buildSubmissionPayload();
    await window.DateInvitationSupabase.submitSubmission(payload);
    state.submitted = true;
    state.submissionError = '';
    saveState();
    renderReview();
  } catch {
    state.submissionError = '暂时没能发送成功，内容还保存在这里，可以再试一次。';
    saveState();
    status.textContent = state.submissionError;
    submitButton.disabled = false;
    submitButton.textContent = '确认发送';
  } finally {
    state.submissionPending = false;
  }
}

function showOutcome(type) {
  if (state.transitioning) return;

  const outcomes = {
    decline: {
      eyebrow: '',
      title: '好，那就不继续啦。',
      detail: '本来就是想逗你玩一下 : )',
      ending: '',
    },
    maybeYes: {
      eyebrow: '',
      title: '那就先这样。',
      detail: '等真的有机会的时候，\n再说。',
      ending: ': )',
    },
    later: {
      eyebrow: '行。',
      title: '那就到时候再说。',
      detail: '',
      ending: ': )',
    },
  };

  const outcome = outcomes[type];
  state.transitioning = true;
  disableCurrentButtons();
  card.classList.add('is-leaving');

  window.setTimeout(() => {
    card.className = 'invitation-card outcome-card';
    card.dataset.screen = 'outcome';
    card.innerHTML = `
      <div class="sprig-mark tall" aria-hidden="true"><i></i><i></i><i></i></div>
      ${outcome.eyebrow ? `<p class="eyebrow">${escapeHtml(outcome.eyebrow)}</p>` : ''}
      <h1 class="title">${escapeHtml(outcome.title)}</h1>
      ${outcome.detail ? `<p class="subtitle">${formatText(outcome.detail)}</p>` : ''}
      ${outcome.ending ? `<p class="outcome-ending">${escapeHtml(outcome.ending)}</p>` : ''}
      <figure class="dog-stamp outcome-stamp" aria-hidden="true">
        <img src="assets/dog-avatar.png" alt="" />
      </figure>
    `;
    state.transitioning = false;
    requestAnimationFrame(() => card.classList.add('is-entering'));
  }, 260);
}

bindEasterEgg();
saveState();
render();
