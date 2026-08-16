const card = document.querySelector('#card');
const stage = document.querySelector('.stage');
const dateApp = document.querySelector('.date-app');
const qixiTracks = [
  {
    id: 'sui-sui-nian',
    title: '碎碎念',
    artist: '队长',
    src: 'https://taihu777.oss-cn-hangzhou.aliyuncs.com/1-sui-sui-nian.mp3',
  },
  {
    id: 'hong-zhi-jian',
    title: '虹之间',
    artist: 'en (王翊恩)',
    src: 'https://taihu777.oss-cn-hangzhou.aliyuncs.com/2-hong-zhi-jian.mp3',
  },
  {
    id: 'wu-ming-de-ren',
    title: '无名的人',
    artist: 'en (王翊恩)',
    src: 'https://taihu777.oss-cn-hangzhou.aliyuncs.com/3-wu-ming-de-ren.mp3',
  },
  {
    id: 'tian-hou',
    title: '天后',
    artist: 'en (王翊恩)',
    src: 'https://taihu777.oss-cn-hangzhou.aliyuncs.com/4-tian-hou.mp3',
  },
];
let currentTrackIndex = 0;
const qixiMusic = new Audio();

qixiMusic.preload = 'none';
qixiMusic.autoplay = false;
qixiMusic.volume = 0.3;
qixiMusic.loop = false;

let qixiMusicHasStarted = false;
let qixiMusicLoadFailed = false;
let qixiMusicTogglePending = false;
let qixiMusicPlaybackActive = false;
let qixiMusicBuffering = false;
let qixiMusicBufferHintVisible = false;
let qixiMusicBufferHintTimer = null;
let musicPickerOpen = false;

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
  { x: 65, y: -12, label: '差一点', yesScale: 1.06, noScale: 0.92 },
  { x: -90, y: 17, label: '又差一点', yesScale: 1.12, noScale: 0.85 },
  { x: 110, y: -18, label: '算了', yesScale: 1.18, noScale: 0.78 },
];
let suppressNoButtonClickUntil = 0;

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
const qixiLightPoints = [
  { x: 9, y: 13, size: 7, opacity: 0.28, blur: 2, duration: 18, delay: -4, dx: 12, dy: -15, tone: 'straw' },
  { x: 79, y: 10, size: 9, opacity: 0.22, blur: 4, duration: 23, delay: -11, dx: -14, dy: 9, tone: 'sage' },
  { x: 25, y: 29, size: 5, opacity: 0.34, blur: 1, duration: 15, delay: -6, dx: 10, dy: -9, tone: 'straw' },
  { x: 91, y: 34, size: 7, opacity: 0.24, blur: 3, duration: 21, delay: -14, dx: -11, dy: -16, tone: 'sage' },
  { x: 10, y: 59, size: 11, opacity: 0.2, blur: 4, duration: 24, delay: -9, dx: 16, dy: 8, tone: 'straw' },
  { x: 88, y: 63, size: 5, opacity: 0.32, blur: 2, duration: 17, delay: -2, dx: -9, dy: 14, tone: 'sage' },
  { x: 20, y: 80, size: 8, opacity: 0.25, blur: 2, duration: 20, delay: -13, dx: 13, dy: -12, tone: 'sage' },
  { x: 73, y: 86, size: 10, opacity: 0.2, blur: 4, duration: 22, delay: -7, dx: -17, dy: 10, tone: 'straw' },
  { x: 5, y: 91, size: 5, opacity: 0.3, blur: 1, duration: 16, delay: -10, dx: 9, dy: -10, tone: 'straw' },
  { x: 94, y: 78, size: 7, opacity: 0.24, blur: 3, duration: 19, delay: -5, dx: -12, dy: 8, tone: 'sage' },
  { x: 66, y: 23, size: 5, opacity: 0.29, blur: 2, duration: 14, delay: -8, dx: 10, dy: -13, tone: 'sage' },
  { x: 38, y: 93, size: 12, opacity: 0.18, blur: 4, duration: 24, delay: -16, dx: 15, dy: -8, tone: 'straw' },
];
const qixiFireworkBursts = [
  { x: 17, y: 20, delay: 650, distance: 66, count: 20, wave: 1 },
  { x: 84, y: 18, delay: 880, distance: 70, count: 20, wave: 1 },
  { x: 10, y: 43, delay: 1120, distance: 60, count: 16, wave: 1 },
  { x: 90, y: 42, delay: 1360, distance: 62, count: 18, wave: 1, mobileOptional: true },
  { x: 30, y: 12, delay: 2100, distance: 88, count: 26, wave: 2 },
  { x: 70, y: 10, delay: 2420, distance: 82, count: 24, wave: 2 },
  { x: 8, y: 67, delay: 2760, distance: 68, count: 20, wave: 2 },
  { x: 92, y: 65, delay: 3120, distance: 70, count: 20, wave: 2, mobileOptional: true },
  { x: 24, y: 80, delay: 3480, distance: 54, count: 14, wave: 2, mobileOptional: true },
  { x: 34, y: 29, delay: 5200, distance: 92, count: 28, wave: 3 },
  { x: 68, y: 31, delay: 5700, distance: 88, count: 26, wave: 3 },
];
const qixiEffectTones = ['champagne', 'ivory', 'gold', 'clay', 'blush', 'sage'];
const qixiFloatingLightPoints = Array.from({ length: 24 }, (_, index) => ({
  x: 4 + ((index * 37) % 92),
  y: 6 + ((index * 29) % 86),
  size: 3 + (index % 5),
  delay: 900 + (index % 8) * 260,
  duration: 7600 + (index % 6) * 700,
  driftX: -16 + (index % 7) * 5,
  driftY: -30 - (index % 5) * 8,
  tone: qixiEffectTones[index % qixiEffectTones.length],
}));
const qixiEmbers = Array.from({ length: 16 }, (_, index) => ({
  x: 8 + ((index * 31) % 84),
  y: 16 + ((index * 19) % 48),
  delay: 1900 + (index % 8) * 520,
  duration: 3800 + (index % 5) * 430,
  drift: -14 + (index % 6) * 6,
  fall: 96 + (index % 5) * 20,
  tone: qixiEffectTones[(index + 2) % qixiEffectTones.length],
}));
const qixiFinalLights = [
  { x: 42, y: 43 }, { x: 49, y: 39 }, { x: 57, y: 43 }, { x: 61, y: 49 },
  { x: 58, y: 57 }, { x: 52, y: 62 }, { x: 44, y: 59 }, { x: 39, y: 53 },
  { x: 47, y: 48 }, { x: 55, y: 52 },
];
const qixiBlessings = [
  '愿你一直有自己的方向。',
  '愿你遇见的都是好天气。',
  '愿很多事情都刚刚好。',
  '愿你的努力都有回应。',
  '愿你一直自由，也一直勇敢。',
  '愿你想去的地方都能抵达。',
  '愿你忙的时候有所收获，闲的时候有所快乐。',
  '愿生活偶尔也给你一点惊喜。',
  '愿你的下一站比这一站更好。',
  '愿你有很多值得期待的明天。',
  '愿那些烦人的事情早点过去。',
  '愿你喜欢的人和事都不辜负你。',
  '愿你一直有重新出发的勇气。',
  '愿你偶尔也可以什么都不想。',
  '愿每一次认真都有意义。',
  '愿你做自己喜欢的自己。',
  '愿好运偶尔偏心你一点。',
  '愿今天以后，也有很多开心的日子。',
  '愿有人一直记得你随口提过的小事。',
  '这一条不算祝福，只是想说，七夕快乐。',
];
const easterEggNotes = [
  '我嘴笨，有时候说的话不经过脑子，希望不会影响到你的心情。',
  '我其实有点敏感，有时候你不经意一句话我会想很久，会自我消耗，所以有时候会突然发癫，抱歉啊。',
  '我不会安慰人，你跟我分享的事，我很喜欢，但是我会经常性因为自己帮不上忙而感到无力，苍白的话语更让我感到无奈，虽然你说过只是让我听着。',
  '我偶尔会想你为什么来找我，我真的想过很久，分析了很多，结果现在好像不重要，但是我真的超级超级开心，因为从那以后生活里多了很多有意思的事，也多了很多期待。',
  '该怎么形容那天期末周复习无力，无意翻看微信，看到一个陌生好友申请，在经过重重确认后，全身像遭遇电击那样的震撼感呢——真是前所未有的感觉。',
  '我买了你推荐的零食，真的很好吃，你真会挑零食呀。',
  '其实还有很多话，我之后慢慢加。原本觉得这些话你大概率也不会看到，不过你真看到这里的话，已经比我预计得远多了。',
];
let microReactionTimers = [];
let successEpilogueTimers = [];
let easterEggCopyTimers = [];
let easterEggTapCount = 0;
let easterEggResetTimer = null;
let easterEggRevealed = false;
let paperPlaneNotesUnlocked = false;
let paperPlaneFeedbackTimer = null;
let paperPlaneDepartureTimer = null;
let qixiFinalTransitioning = false;
let qixiFinalTapCount = 0;
let qixiFireworkTriggered = false;
let qixiFinalHintTimer = null;
let qixiDiscoveryHintTimer = null;
let qixiFireworkStartTimer = null;
let qixiFireworkActivationTimer = null;
let qixiFireworkCleanupTimer = null;
let qixiHeartStartTimer = null;
let qixiHeartCompleteTimer = null;
let qixiInteractiveFinaleReady = false;
let qixiHeartFormationComplete = false;
let qixiFinalePointerStart = null;
let qixiLastInteractiveFireworkAt = 0;
let qixiInteractiveHintTimer = null;
let qixiFinalHintDismissed = false;
let qixiBlessingBag = [];
let qixiLastBlessing = '';
let qixiBlessingSwapTimer = null;
let qixiBlessingFadeTimer = null;
const qixiInteractiveFireworks = new Map();

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

function isQixiMusicPlaying() {
  return (
    qixiMusicPlaybackActive &&
    !qixiMusicLoadFailed &&
    !qixiMusic.paused &&
    !qixiMusic.ended
  );
}

function isQixiMusicPlaybackEngaged() {
  return !qixiMusicLoadFailed && !qixiMusic.paused && !qixiMusic.ended;
}

function getCurrentQixiTrack() {
  return qixiTracks[currentTrackIndex];
}

function getQixiMusicHint() {
  const track = getCurrentQixiTrack();
  if (qixiMusicLoadFailed) return '这首歌暂时没加载出来';
  if (qixiMusicBufferHintVisible) return '缓冲一下…';
  if (qixiMusicBuffering) return `${track.title} · ${track.artist}`;
  if (qixiMusic.ended) return '听完啦 · 点一下可以再听';
  if (isQixiMusicPlaying()) return `${track.title} · ${track.artist}`;
  if (qixiMusicHasStarted) return '已暂停 · 点一下继续';
  return '点一下，有首歌想给你听';
}

function renderMusicTrackOption(track, index) {
  return `
        <button
          class="music-track-option${index === currentTrackIndex ? ' is-current' : ''}"
          type="button"
          data-track-index="${index}"
          aria-pressed="${index === currentTrackIndex}"
        >
          <span class="music-track-check" aria-hidden="true">${
            index === currentTrackIndex ? '✓' : ''
          }</span>
          <span class="music-track-copy">
            <strong>${escapeHtml(track.title)}</strong>
            <small class="music-track-artist">${escapeHtml(track.artist)}</small>
          </span>
        </button>`;
}

function renderMusicTrackPicker() {
  return `
    <section class="music-track-group" aria-label="我想先给你听的">
      <p class="music-track-group-label">我想先给你听的</p>
      <div class="music-track-options">
        ${renderMusicTrackOption(qixiTracks[0], 0)}
      </div>
    </section>
    <section class="music-track-group music-track-group-shared" aria-label="你之前分享给我的">
      <p class="music-track-group-label">你之前分享给我的</p>
      <div class="music-track-options">
        ${qixiTracks
          .slice(1)
          .map((track, index) => renderMusicTrackOption(track, index + 1))
          .join('')}
      </div>
    </section>
    <p class="music-track-note">还有几首你之前分享过的，我没找到合适的版本，就先放这几首啦。</p>
  `;
}

function syncMusicRecords() {
  const isPlaying = isQixiMusicPlaying();
  const isPlaybackEngaged = isQixiMusicPlaybackEngaged();
  const currentTrack = getCurrentQixiTrack();
  document.querySelectorAll('.music-record').forEach((record) => {
    record.classList.toggle('is-playing', isPlaying);
    record.setAttribute('aria-pressed', String(isPlaybackEngaged));
    record.setAttribute(
      'aria-label',
      `${isPlaybackEngaged ? '暂停' : '播放'}《${currentTrack.title}》`,
    );
    record.setAttribute('title', `播放 / 暂停《${currentTrack.title}》`);
  });

  document.querySelectorAll('.music-hint').forEach((hint) => {
    hint.textContent = getQixiMusicHint();
  });

  document.querySelectorAll('.music-change-button').forEach((button) => {
    button.hidden = !qixiMusicHasStarted;
    button.setAttribute('aria-expanded', String(qixiMusicHasStarted && musicPickerOpen));
  });

  document.querySelectorAll('.music-meta-separator').forEach((separator) => {
    separator.hidden = !qixiMusicHasStarted;
  });

  document.querySelectorAll('.music-track-option').forEach((option) => {
    const isCurrent = Number(option.dataset.trackIndex) === currentTrackIndex;
    option.classList.toggle('is-current', isCurrent);
    option.setAttribute('aria-pressed', String(isCurrent));
    const check = option.querySelector('.music-track-check');
    if (check) check.textContent = isCurrent ? '✓' : '';
  });

  document.querySelectorAll('.music-track-picker').forEach((picker) => {
    const shouldOpen = qixiMusicHasStarted && musicPickerOpen;
    if (!shouldOpen) {
      picker.classList.remove('is-open');
      picker.hidden = true;
      return;
    }

    picker.hidden = false;
    if (reduceMotion.matches) {
      picker.classList.add('is-open');
    } else {
      requestAnimationFrame(() => {
        if (picker.isConnected && musicPickerOpen) picker.classList.add('is-open');
      });
    }
  });
}

async function toggleQixiMusic() {
  if (qixiMusicTogglePending) return;

  if (isQixiMusicPlaybackEngaged()) {
    qixiMusic.pause();
    return;
  }

  if (qixiMusic.ended) qixiMusic.currentTime = 0;
  qixiMusicTogglePending = true;

  try {
    qixiMusic.preload = 'auto';
    qixiMusicLoadFailed = false;
    if (!qixiMusic.getAttribute('src') || qixiMusic.error) {
      clearQixiMusicBufferingState();
      qixiMusic.src = getCurrentQixiTrack().src;
    }
    const playPromise = qixiMusic.play();
    if (playPromise) await playPromise;
    qixiMusicHasStarted = true;
    qixiMusicLoadFailed = false;
  } catch {
    qixiMusicLoadFailed = true;
    qixiMusic.pause();
  } finally {
    qixiMusicTogglePending = false;
    syncMusicRecords();
  }
}

async function selectQixiTrack(nextTrackIndex) {
  if (
    qixiMusicTogglePending ||
    !Number.isInteger(nextTrackIndex) ||
    !qixiTracks[nextTrackIndex]
  ) {
    return;
  }

  const changeButton = document.querySelector('.music-change-button');
  if (nextTrackIndex === currentTrackIndex) {
    musicPickerOpen = false;
    syncMusicRecords();
    changeButton?.focus({ preventScroll: true });
    return;
  }

  qixiMusicTogglePending = true;
  qixiMusic.pause();
  currentTrackIndex = nextTrackIndex;
  qixiMusicLoadFailed = false;
  musicPickerOpen = false;
  syncMusicRecords();
  changeButton?.focus({ preventScroll: true });

  try {
    qixiMusic.preload = 'auto';
    clearQixiMusicBufferingState();
    qixiMusic.src = getCurrentQixiTrack().src;
    qixiMusic.currentTime = 0;
    await qixiMusic.play();
    qixiMusicHasStarted = true;
    qixiMusicLoadFailed = false;
  } catch {
    qixiMusicLoadFailed = true;
    qixiMusic.pause();
  } finally {
    qixiMusicTogglePending = false;
    syncMusicRecords();
  }
}

function bindMusicRecords() {
  document.querySelectorAll('.music-record').forEach((record) => {
    if (record.dataset.musicBound === 'true') return;

    record.dataset.musicBound = 'true';
    record.addEventListener('click', toggleQixiMusic);
    record.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleQixiMusic();
    });
  });

  document.querySelectorAll('.music-change-button').forEach((button) => {
    if (button.dataset.musicPickerBound === 'true') return;

    button.dataset.musicPickerBound = 'true';
    button.addEventListener('click', () => {
      musicPickerOpen = !musicPickerOpen;
      syncMusicRecords();
    });
  });

  document.querySelectorAll('.music-track-option').forEach((option) => {
    if (option.dataset.musicPickerBound === 'true') return;

    option.dataset.musicPickerBound = 'true';
    option.addEventListener('click', () => {
      selectQixiTrack(Number(option.dataset.trackIndex));
    });
  });

  syncMusicRecords();
}

function clearQixiMusicBufferingState() {
  window.clearTimeout(qixiMusicBufferHintTimer);
  qixiMusicBufferHintTimer = null;
  qixiMusicBuffering = false;
  qixiMusicBufferHintVisible = false;
}

function handleQixiMusicPlaying() {
  clearQixiMusicBufferingState();
  qixiMusicPlaybackActive = true;
  qixiMusicHasStarted = true;
  qixiMusicLoadFailed = false;
  syncMusicRecords();
}

function handleQixiMusicBuffering() {
  if (qixiMusic.paused || qixiMusic.ended || qixiMusicLoadFailed) return;

  qixiMusicPlaybackActive = false;
  if (!qixiMusicBuffering) {
    qixiMusicBuffering = true;
    window.clearTimeout(qixiMusicBufferHintTimer);
    qixiMusicBufferHintTimer = window.setTimeout(() => {
      if (!qixiMusicBuffering || qixiMusic.paused || qixiMusic.ended) return;
      qixiMusicBufferHintVisible = true;
      syncMusicRecords();
    }, 400);
  }
  syncMusicRecords();
}

function handleQixiMusicStopped() {
  qixiMusicPlaybackActive = false;
  clearQixiMusicBufferingState();
  syncMusicRecords();
}

function handleQixiMusicLoadStart() {
  qixiMusicPlaybackActive = false;
  syncMusicRecords();
}

function handleQixiPassiveMediaEvent() {
  // Readiness/progress/suspend events do not prove that audio is audibly playing.
}

qixiMusic.addEventListener('loadstart', handleQixiMusicLoadStart);
qixiMusic.addEventListener('loadedmetadata', handleQixiPassiveMediaEvent);
qixiMusic.addEventListener('canplay', handleQixiPassiveMediaEvent);
qixiMusic.addEventListener('play', () => {
  qixiMusicLoadFailed = false;
});
qixiMusic.addEventListener('playing', handleQixiMusicPlaying);
qixiMusic.addEventListener('waiting', handleQixiMusicBuffering);
qixiMusic.addEventListener('stalled', handleQixiMusicBuffering);
qixiMusic.addEventListener('suspend', handleQixiPassiveMediaEvent);
qixiMusic.addEventListener('progress', handleQixiPassiveMediaEvent);
qixiMusic.addEventListener('pause', handleQixiMusicStopped);
qixiMusic.addEventListener('ended', handleQixiMusicStopped);
qixiMusic.addEventListener('error', () => {
  qixiMusicLoadFailed = true;
  qixiMusicPlaybackActive = false;
  clearQixiMusicBufferingState();
  qixiMusic.pause();
  syncMusicRecords();
});

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

function getResultCardData(sourceState = state) {
  const primary = getActivitySummary(sourceState.primaryActivity, sourceState);
  const secondary = getActivitySummary(sourceState.secondaryActivity, sourceState);

  return {
    primaryActivity: primary?.activity_label || '',
    primaryPreference: primary?.preference_label || '',
    secondaryActivity: secondary?.activity_label || '到时候再说',
    secondaryPreference: secondary?.preference_label || '不急着安排下一站',
    invitationResponse: getInvitationResponseLabel(sourceState.invitationResponse),
    ending: getEndingCopy(sourceState.primaryActivity),
  };
}

async function saveResultCard(event) {
  const button = event.currentTarget;
  const status = card.querySelector('#resultCardStatus');
  if (!state.submitted || button.disabled) return;

  button.disabled = true;
  button.textContent = '正在整理…';
  status.textContent = '';

  try {
    const result = await window.DateInvitationResultCard?.save(getResultCardData());
    if (!result) throw new Error('结果卡片功能不可用。');

    status.textContent =
      result.method === 'share'
        ? '已经交给分享面板了。'
        : result.method === 'download'
          ? '图片已经保存。'
          : '';
  } catch {
    status.textContent = '暂时没能保存，可以再试一次。';
  } finally {
    button.disabled = false;
    button.textContent = '保存这次选择';
  }
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

function renderQixiLightPoints() {
  return qixiLightPoints
    .map(
      (point) => `<span class="qixi-light-point qixi-light-point-${point.tone}" style="--point-x:${
        point.x
      }%;--point-y:${point.y}%;--point-size:${point.size}px;--point-opacity:${
        point.opacity
      };--point-blur:${point.blur}px;--point-duration:${point.duration}s;--point-delay:${
        point.delay
      }s;--point-drift-x:${point.dx}px;--point-drift-y:${point.dy}px"></span>`,
    )
    .join('');
}

function renderQixiFireworks() {
  return qixiFireworkBursts
    .map((burst, burstIndex) => {
      const outerCount = Math.ceil(burst.count * 0.68);
      const innerCount = burst.count - outerCount;
      const sparks = Array.from({ length: burst.count }, (_, sparkIndex) => {
        const isInner = sparkIndex >= outerCount;
        const ringIndex = isInner ? sparkIndex - outerCount : sparkIndex;
        const ringCount = isInner ? innerCount : outerCount;
        const angle = (Math.PI * 2 * ringIndex) / ringCount + burstIndex * 0.13 + (isInner ? 0.17 : 0);
        const distance = burst.distance * (isInner ? 0.58 : 0.9 + (sparkIndex % 3) * 0.05);
        const sparkX = (Math.cos(angle) * distance).toFixed(1);
        const sparkY = (Math.sin(angle) * distance).toFixed(1);
        const sparkDelay = burst.delay + (isInner ? 170 : 0) + (sparkIndex % 2) * 34;
        const tone = qixiEffectTones[(sparkIndex + burstIndex) % qixiEffectTones.length];
        return `<span class="qixi-firework-spark qixi-effect-${tone}${
          isInner ? ' is-inner-ring' : ''
        }" style="--spark-x:${sparkX}px;--spark-y:${sparkY}px;--spark-angle:${angle.toFixed(
          3,
        )}rad;--spark-delay:${sparkDelay}ms"></span>`;
      }).join('');

      return `<span class="qixi-firework-burst qixi-firework-wave-${burst.wave}${
        burst.mobileOptional ? ' is-mobile-optional' : ''
      }" style="--burst-x:${burst.x}%;--burst-y:${burst.y}%;--burst-delay:${burst.delay}ms">${sparks}</span>`;
    })
    .join('');
}

function renderQixiFloatingLights() {
  return qixiFloatingLightPoints
    .map(
      (point) => `<span class="qixi-float-light qixi-effect-${point.tone}" style="--float-x:${
        point.x
      }%;--float-y:${point.y}%;--float-size:${point.size}px;--float-delay:${
        point.delay
      }ms;--float-duration:${point.duration}ms;--float-drift-x:${point.driftX}px;--float-drift-y:${
        point.driftY
      }px"></span>`,
    )
    .join('');
}

function renderQixiEmbers() {
  return qixiEmbers
    .map(
      (point) => `<span class="qixi-ember qixi-effect-${point.tone}" style="--ember-x:${
        point.x
      }%;--ember-y:${point.y}%;--ember-delay:${point.delay}ms;--ember-duration:${
        point.duration
      }ms;--ember-drift:${point.drift}px;--ember-fall:${point.fall}px"></span>`,
    )
    .join('');
}

function renderQixiFinalLights() {
  return qixiFinalLights
    .map(
      (point, index) => `<span class="qixi-final-light qixi-effect-${
        qixiEffectTones[index % qixiEffectTones.length]
      }" style="--final-x:${point.x}%;--final-y:${point.y}%;--final-delay:${
        6600 + index * 90
      }ms"></span>`,
    )
    .join('');
}

function renderQixiReducedFinale() {
  const stars = Array.from({ length: 24 }, (_, index) => {
    const x = 5 + ((index * 37) % 90);
    const y = 7 + ((index * 23) % 84);
    const size = 3 + (index % 5);
    const tone = qixiEffectTones[index % qixiEffectTones.length];
    return `<span class="qixi-reduced-star qixi-effect-${tone}" style="--reduced-x:${x}%;--reduced-y:${y}%;--reduced-size:${size}px;--reduced-delay:${
      (index % 6) * 180
    }ms"></span>`;
  }).join('');

  const halos = [
    [22, 27, 150],
    [78, 31, 190],
    [52, 68, 230],
  ]
    .map(
      ([x, y, size], index) => `<span class="qixi-reduced-halo" style="--halo-x:${x}%;--halo-y:${
        y
      }%;--halo-size:${size}px;--halo-delay:${index * 320}ms"></span>`,
    )
    .join('');

  return `${halos}${stars}`;
}

function renderQixiCalmLights() {
  return Array.from({ length: 10 }, (_, index) => {
    const x = 7 + ((index * 41) % 86);
    const y = 9 + ((index * 27) % 82);
    const tone = index % 2 === 0 ? 'champagne' : 'sage';
    return `<span class="qixi-calm-light qixi-effect-${tone}" style="--calm-x:${x}%;--calm-y:${y}%;--calm-size:${
      2 + (index % 3)
    }px"></span>`;
  }).join('');
}

function renderQixiHeartParticles() {
  const mobileOptionalIndexes = new Set([4, 13, 22, 30]);
  return Array.from({ length: 34 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 34;
    const heartX = 16 * Math.sin(angle) ** 3;
    const heartY = 13 * Math.cos(angle) - 5 * Math.cos(angle * 2) - 2 * Math.cos(angle * 3) - Math.cos(angle * 4);
    const jitterX = ((index * 7) % 5 - 2) * 0.38;
    const jitterY = ((index * 11) % 5 - 2) * 0.32;
    const targetX = 50 + (heartX / 16) * 45 + jitterX;
    const targetY = 6 + ((12 - heartY) / 29) * 88 + jitterY;
    const travelsFromFireworks = index === 0 || index % 3 !== 0;
    const direction = index % 4;
    const fromX = index === 0
      ? 0
      : travelsFromFireworks
        ? (direction < 2 ? -1 : 1) * (150 + (index % 5) * 24)
        : -32 + (index % 5) * 16;
    const fromY = index === 0
      ? -165
      : travelsFromFireworks
        ? [-145, -78, 112, 168][direction]
        : -22 + (index % 4) * 15;
    const delay = index === 0 ? 0 : 420 + Math.floor((index - 1) / 4) * 125;
    const duration = index === 0 ? 2200 : 1800 + (index % 6) * 220;
    const size = 4 + (index % 4);
    const tone = qixiEffectTones[(index + 1) % qixiEffectTones.length];
    return `<span class="qixi-heart-particle${index === 0 ? ' is-heart-lead' : ''}${
      mobileOptionalIndexes.has(index) ? ' is-mobile-optional' : ''
    } qixi-effect-${tone}" style="--heart-x:${targetX.toFixed(2)}%;--heart-y:${targetY.toFixed(
      2,
    )}%;--heart-from-x:${fromX}px;--heart-from-y:${fromY}px;--heart-delay:${
      delay
    }ms;--heart-duration:${duration}ms;--heart-size:${size}px;--heart-breathe:${
      3200 + (index % 7) * 380
    }ms;--heart-breathe-delay:${-index * 140}ms"><i></i></span>`;
  }).join('');
}

function enableQixiInteractiveFinale() {
  if (
    qixiInteractiveFinaleReady ||
    !qixiHeartFormationComplete ||
    card.dataset.screen !== 'qixi-final'
  ) {
    return;
  }
  qixiInteractiveFinaleReady = true;
  dateApp?.classList.add('is-qixi-interactive-ready');
  card.classList.add('is-interactive-ready');
  scheduleQixiInteractiveHint();
}

function scheduleQixiInteractiveHint() {
  window.clearTimeout(qixiInteractiveHintTimer);
  if (qixiFinalHintDismissed) return;

  qixiInteractiveHintTimer = window.setTimeout(() => {
    if (
      qixiFinalHintDismissed ||
      !qixiInteractiveFinaleReady ||
      card.dataset.screen !== 'qixi-final'
    ) {
      return;
    }

    const hint = card.querySelector('.qixi-interactive-hint');
    if (!hint) return;
    hint.hidden = false;
    void hint.offsetWidth;
    if (!qixiFinalHintDismissed && hint.isConnected) hint.classList.add('is-visible');
  }, 1100);
}

function dismissQixiInteractiveHint() {
  qixiFinalHintDismissed = true;
  window.clearTimeout(qixiInteractiveHintTimer);
  const hint = card.querySelector('.qixi-interactive-hint');
  if (!hint) return;

  hint.classList.remove('is-visible');
  qixiInteractiveHintTimer = window.setTimeout(() => {
    if (hint.isConnected) hint.hidden = true;
  }, reduceMotion.matches ? 0 : 200);
}

function startQixiHeartFormation() {
  const heartLayer = card.querySelector('.qixi-heart-particle-layer');
  if (!heartLayer || qixiHeartFormationComplete) return;

  heartLayer.innerHTML = renderQixiHeartParticles();
  heartLayer.classList.remove('is-forming', 'is-complete');
  void heartLayer.offsetWidth;

  const activateHeart = () => {
    if (!heartLayer.isConnected || heartLayer.classList.contains('is-forming')) return;
    heartLayer.classList.add('is-forming');
    void heartLayer.offsetWidth;
    const startTime = document.timeline.currentTime;
    heartLayer.getAnimations({ subtree: true }).forEach((animation) => {
      animation.startTime = startTime;
    });
  };
  requestAnimationFrame(() => requestAnimationFrame(activateHeart));
  window.setTimeout(activateHeart, 32);

  window.clearTimeout(qixiHeartCompleteTimer);
  qixiHeartCompleteTimer = window.setTimeout(() => {
    if (!heartLayer.isConnected) return;
    qixiHeartFormationComplete = true;
    heartLayer.classList.add('is-complete');
    card.querySelector('.qixi-final-main')?.classList.add('is-heart-glowing');
    window.setTimeout(
      () => card.querySelector('.qixi-final-main')?.classList.remove('is-heart-glowing'),
      reduceMotion.matches ? 700 : 760,
    );
    if (!dateApp?.classList.contains('is-qixi-grand-finale')) enableQixiInteractiveFinale();
  }, reduceMotion.matches ? 3300 : 4500);
}

function removeQixiInteractiveFirework(element) {
  const timer = qixiInteractiveFireworks.get(element);
  if (timer) window.clearTimeout(timer);
  qixiInteractiveFireworks.delete(element);
  element.remove();
}

function clearQixiInteractiveFinale() {
  qixiInteractiveFireworks.forEach((timer, element) => {
    window.clearTimeout(timer);
    element.remove();
  });
  qixiInteractiveFireworks.clear();
  window.clearTimeout(qixiBlessingSwapTimer);
  window.clearTimeout(qixiBlessingFadeTimer);
  window.clearTimeout(qixiInteractiveHintTimer);
  qixiInteractiveFinaleReady = false;
  qixiHeartFormationComplete = false;
  qixiFinalePointerStart = null;
  qixiLastInteractiveFireworkAt = 0;
  qixiBlessingBag = [];
  qixiLastBlessing = '';
  dateApp?.classList.remove('is-qixi-interactive-ready');
}

function refillQixiBlessingBag() {
  qixiBlessingBag = [...qixiBlessings];
  for (let index = qixiBlessingBag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [qixiBlessingBag[index], qixiBlessingBag[swapIndex]] = [
      qixiBlessingBag[swapIndex],
      qixiBlessingBag[index],
    ];
  }

  const nextIndex = qixiBlessingBag.length - 1;
  if (qixiBlessingBag[nextIndex] === qixiLastBlessing && nextIndex > 0) {
    [qixiBlessingBag[nextIndex], qixiBlessingBag[0]] = [
      qixiBlessingBag[0],
      qixiBlessingBag[nextIndex],
    ];
  }
}

function takeQixiBlessing() {
  if (qixiBlessingBag.length === 0) refillQixiBlessingBag();
  const blessing = qixiBlessingBag.pop();
  qixiLastBlessing = blessing;
  return blessing;
}

function showQixiBlessing() {
  const line = card.querySelector('.qixi-blessing-line');
  if (!line) return;

  const blessing = takeQixiBlessing();
  window.clearTimeout(qixiBlessingSwapTimer);
  window.clearTimeout(qixiBlessingFadeTimer);
  line.classList.remove('is-visible');
  qixiBlessingSwapTimer = window.setTimeout(() => {
    if (!line.isConnected) return;
    line.textContent = blessing;
    void line.offsetWidth;
    line.classList.add('is-visible');
    qixiBlessingFadeTimer = window.setTimeout(() => line.classList.remove('is-visible'), 4200);
  }, line.textContent ? 170 : 220);
}

function createQixiInteractiveFirework(clientX, clientY) {
  const layer = card.querySelector('.qixi-click-firework-layer');
  if (!qixiInteractiveFinaleReady || !layer) return false;

  if (qixiInteractiveFireworks.size >= 5) {
    const oldest = qixiInteractiveFireworks.keys().next().value;
    if (oldest) removeQixiInteractiveFirework(oldest);
  }

  const isMobile = window.innerWidth <= 640;
  const sparkCount = reduceMotion.matches ? 8 : isMobile ? 12 : 16;
  const radius = reduceMotion.matches ? 22 : isMobile ? 52 + Math.random() * 14 : 66 + Math.random() * 18;
  const tonePairs = [
    ['champagne', 'ivory'],
    ['gold', 'champagne'],
    ['clay', 'blush'],
    ['sage', 'ivory'],
  ];
  const tones = tonePairs[Math.floor(Math.random() * tonePairs.length)];
  const firework = document.createElement('span');
  firework.className = `qixi-click-firework${reduceMotion.matches ? ' is-reduced' : ''}`;
  firework.style.setProperty('--click-left', `${clientX}px`);
  firework.style.setProperty('--click-top', `${clientY}px`);
  firework.innerHTML = Array.from({ length: sparkCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / sparkCount + Math.random() * 0.08;
    const distance = radius * (0.78 + Math.random() * 0.22);
    const duration = reduceMotion.matches ? 680 : 880 + Math.round(Math.random() * 300);
    return `<i class="qixi-click-spark qixi-effect-${tones[index % tones.length]}" style="--click-x:${(
      Math.cos(angle) * distance
    ).toFixed(1)}px;--click-y:${(Math.sin(angle) * distance).toFixed(
      1,
    )}px;--click-angle:${angle.toFixed(3)}rad;--click-duration:${duration}ms"></i>`;
  }).join('');
  layer.append(firework);

  const activateFirework = () => {
    if (!firework.isConnected || firework.classList.contains('is-active')) return;
    firework.classList.add('is-active');
    void firework.offsetWidth;
    const startTime = document.timeline.currentTime;
    firework.getAnimations({ subtree: true }).forEach((animation) => {
      animation.startTime = startTime;
    });
  };
  requestAnimationFrame(() => requestAnimationFrame(activateFirework));
  window.setTimeout(activateFirework, 32);

  const cleanupTimer = window.setTimeout(
    () => removeQixiInteractiveFirework(firework),
    reduceMotion.matches ? 820 : 1380,
  );
  qixiInteractiveFireworks.set(firework, cleanupTimer);
  dismissQixiInteractiveHint();
  showQixiBlessing();
  return true;
}

function handleQixiFinalePointerDown(event) {
  if (!qixiInteractiveFinaleReady || stage.dataset.screen !== 'qixi-final') return;
  qixiFinalePointerStart = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    target: event.target,
  };
}

function handleQixiFinalePointerUp(event) {
  const start = qixiFinalePointerStart;
  qixiFinalePointerStart = null;
  if (!qixiInteractiveFinaleReady || !start || start.pointerId !== event.pointerId) return;
  if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
  const interactiveSelector = 'button, a, input, textarea, select, [role="button"], [contenteditable="true"]';
  if (start.target instanceof Element && start.target.closest(interactiveSelector)) return;
  if (event.target instanceof Element && event.target.closest(interactiveSelector)) return;

  const now = performance.now();
  if (now - qixiLastInteractiveFireworkAt < 180) return;
  qixiLastInteractiveFireworkAt = now;
  createQixiInteractiveFirework(event.clientX, event.clientY);
}

function bindQixiFinaleInteraction() {
  dateApp?.addEventListener('pointerdown', handleQixiFinalePointerDown);
  dateApp?.addEventListener('pointerup', handleQixiFinalePointerUp);
  dateApp?.addEventListener('pointercancel', () => {
    qixiFinalePointerStart = null;
  });
}

function setQixiFinalHint(copy, visibleFor = 0) {
  const hint = card.querySelector('.qixi-final-secret');
  if (!hint) return;

  window.clearTimeout(qixiFinalHintTimer);
  hint.textContent = copy;
  hint.classList.toggle('is-visible', Boolean(copy));

  if (visibleFor > 0) {
    qixiFinalHintTimer = window.setTimeout(() => {
      hint.classList.remove('is-visible');
    }, visibleFor);
  }
}

function hideQixiDiscoveryHint() {
  window.clearTimeout(qixiDiscoveryHintTimer);
  const discoveryHint = card.querySelector('.qixi-discovery-hint');
  if (!discoveryHint) return;
  discoveryHint.classList.remove('is-visible');
  discoveryHint.hidden = true;
}

function triggerQixiFirework() {
  const sceneEffects = stage.querySelector('.qixi-scene-effects');
  const fireworkField = card.querySelector('.qixi-firework-field');
  const lightField = sceneEffects?.querySelector('.qixi-light-field');
  if (!sceneEffects || !fireworkField || !lightField) return;

  dateApp?.classList.remove('is-qixi-grand-calm');
  dateApp?.classList.add('is-qixi-grand-finale');
  sceneEffects.classList.remove('is-grand-calm');
  sceneEffects.classList.add('is-firework-enhanced', 'is-grand-finale');
  card.classList.remove('is-grand-calm');
  card.classList.add('is-grand-finale');
  card.querySelector('.qixi-final-main')?.classList.add('is-celebrating');
  fireworkField.classList.remove('is-active');

  if (reduceMotion.matches) {
    fireworkField.innerHTML = renderQixiReducedFinale();
  } else {
    fireworkField.innerHTML = `${renderQixiFireworks()}${renderQixiFloatingLights()}${renderQixiEmbers()}${renderQixiFinalLights()}`;
  }

  void fireworkField.offsetWidth;
  let fireworkActivated = false;
  const activateFirework = () => {
    if (fireworkActivated || !fireworkField.isConnected) return;
    fireworkActivated = true;
    fireworkField.classList.add('is-active');
    void fireworkField.offsetWidth;

    const startTime = document.timeline.currentTime;
    fireworkField.getAnimations({ subtree: true }).forEach((animation) => {
      animation.startTime = startTime;
    });
  };
  window.clearTimeout(qixiFireworkActivationTimer);
  qixiFireworkActivationTimer = window.setTimeout(activateFirework, 32);
  requestAnimationFrame(() => {
    requestAnimationFrame(activateFirework);
  });

  window.clearTimeout(qixiHeartStartTimer);
  qixiHeartStartTimer = window.setTimeout(startQixiHeartFormation, 8700);

  window.clearTimeout(qixiFireworkCleanupTimer);
  qixiFireworkCleanupTimer = window.setTimeout(() => {
    dateApp?.classList.remove('is-qixi-grand-finale');
    dateApp?.classList.add('is-qixi-grand-calm');
    sceneEffects.classList.remove('is-firework-enhanced', 'is-grand-finale');
    sceneEffects.classList.add('is-grand-calm');
    card.classList.remove('is-grand-finale');
    card.classList.add('is-grand-calm');
    window.clearTimeout(qixiFireworkActivationTimer);
    fireworkField.classList.remove('is-active');
    fireworkField.replaceChildren();
    card.querySelector('.qixi-final-main')?.classList.remove('is-celebrating');
    if (qixiHeartFormationComplete) enableQixiInteractiveFinale();
  }, reduceMotion.matches ? 10000 : 14000);
}

function handleQixiFinalTap() {
  if (qixiFireworkTriggered) return;

  hideQixiDiscoveryHint();
  qixiFinalTapCount += 1;
  if (qixiFinalTapCount === 1) {
    setQixiFinalHint('别点啦，真的没有彩蛋了。', 2000);
    return;
  }
  if (qixiFinalTapCount === 2) {
    setQixiFinalHint('拜托，真的没有了。', 2000);
    return;
  }

  qixiFireworkTriggered = true;
  setQixiFinalHint('好吧好吧……既然你都发现了。');
  window.clearTimeout(qixiFireworkStartTimer);
  qixiFireworkStartTimer = window.setTimeout(() => {
    setQixiFinalHint('那就再送你一场烟花。', 3400);
    triggerQixiFirework();
  }, 760);
}

function renderQixiFinal() {
  qixiFinalTapCount = 0;
  qixiFireworkTriggered = false;
  window.clearTimeout(qixiFinalHintTimer);
  window.clearTimeout(qixiDiscoveryHintTimer);
  window.clearTimeout(qixiFireworkStartTimer);
  window.clearTimeout(qixiFireworkActivationTimer);
  window.clearTimeout(qixiFireworkCleanupTimer);
  window.clearTimeout(qixiHeartStartTimer);
  window.clearTimeout(qixiHeartCompleteTimer);
  clearQixiInteractiveFinale();
  dateApp?.classList.remove('is-qixi-transitioning');
  dateApp?.classList.remove('is-qixi-grand-finale', 'is-qixi-grand-calm');
  dateApp?.classList.add('is-qixi-final');
  stage.dataset.screen = 'qixi-final';

  stage.querySelector('.qixi-scene-effects')?.remove();
  const sceneEffects = document.createElement('div');
  sceneEffects.className = 'qixi-scene-effects';
  sceneEffects.setAttribute('aria-hidden', 'true');
  sceneEffects.innerHTML = `
    <div class="qixi-bokeh-field">
      <span class="qixi-bokeh qixi-bokeh-one"></span>
      <span class="qixi-bokeh qixi-bokeh-two"></span>
      <span class="qixi-bokeh qixi-bokeh-three"></span>
    </div>
    <div class="qixi-light-field">
      ${renderQixiLightPoints()}
    </div>
    <div class="qixi-calm-field">
      ${renderQixiCalmLights()}
    </div>
  `;
  stage.insertBefore(sceneEffects, card);

  card.className = 'invitation-card qixi-final-card';
  card.dataset.screen = 'qixi-final';
  card.tabIndex = -1;
  card.innerHTML = `
    <div class="qixi-final-effect-layer" aria-hidden="true">
      <div class="qixi-firework-field"></div>
      <div class="qixi-click-firework-layer"></div>
    </div>
    <div class="qixi-heart-particle-layer" aria-hidden="true"></div>
    <div class="qixi-final-message">
      <p class="qixi-final-copy">
        <span class="qixi-final-prefix">好啦，</span>
        <button class="qixi-final-main" type="button">七夕快乐。</button>
      </p>
      <p class="qixi-discovery-hint">好像还可以再点一下。</p>
      <p class="qixi-final-secret" aria-live="polite"></p>
      <p class="qixi-interactive-hint" aria-hidden="true" hidden>点点看</p>
      <p class="qixi-blessing-line" aria-live="polite"></p>
    </div>
  `;

  card.querySelector('.qixi-final-main')?.addEventListener('click', handleQixiFinalTap);

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  card.focus({ preventScroll: true });
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      sceneEffects.classList.add('is-visible');
      card.classList.add('is-visible');
    }),
  );

  qixiDiscoveryHintTimer = window.setTimeout(() => {
    const discoveryHint = card.querySelector('.qixi-discovery-hint');
    if (qixiFinalTapCount === 0 && discoveryHint) discoveryHint.classList.add('is-visible');
  }, 2800);
}

function openQixiFinal(event) {
  if (!state.submitted || qixiFinalTransitioning) return;

  qixiFinalTransitioning = true;
  event.currentTarget.disabled = true;
  clearSuccessEpilogueTimers();
  dateApp?.classList.add('is-qixi-transitioning');
  card.classList.remove('is-entering');
  card.classList.add('is-qixi-leaving');

  window.setTimeout(renderQixiFinal, reduceMotion.matches ? 0 : 420);
}

function triggerEasterEgg() {
  if (easterEggRevealed || !stage) return;

  window.clearTimeout(easterEggResetTimer);
  easterEggTapCount += 1;
  animatePaperPlane(easterEggTapCount);
  if (easterEggTapCount < 5) {
    easterEggResetTimer = window.setTimeout(() => {
      easterEggTapCount = 0;
    }, 4000);
    return;
  }

  easterEggRevealed = true;
  const planeButton = document.querySelector('.paper-plane-easter-egg');
  if (planeButton) planeButton.disabled = true;
  window.clearTimeout(paperPlaneDepartureTimer);
  paperPlaneDepartureTimer = window.setTimeout(
    () => {
      if (planeButton) planeButton.hidden = true;
      revealEasterEggCopy();
    },
    reduceMotion.matches ? 150 : 460,
  );
}

function revealEasterEggCopy() {
  if (!stage) return;

  easterEggCopyTimers.forEach((timer) => window.clearTimeout(timer));
  easterEggCopyTimers = [];
  const message = document.createElement('div');
  message.className = 'easter-egg-copy';
  message.setAttribute('aria-live', 'polite');
  message.innerHTML = `
    <div class="easter-egg-opening">
      <p class="easter-egg-first">你居然真的发现这里了。</p>
      <p class="easter-egg-second">好吧，这句话本来就是留给你的。</p>
    </div>
    <div class="paper-plane-lock">
      <p class="paper-plane-lock-copy">不过，后面的话好像还上了锁。</p>
      <form class="paper-plane-lock-form" novalidate>
        <label class="sr-only" for="paperPlanePassword">四位数密码</label>
        <input
          class="paper-plane-lock-input"
          id="paperPlanePassword"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="4"
          autocomplete="off"
          aria-describedby="paperPlanePasswordHint paperPlanePasswordStatus"
          placeholder="····"
        />
        <button class="paper-plane-unlock-button" type="submit">解锁</button>
      </form>
      <p class="paper-plane-lock-hint" id="paperPlanePasswordHint">提示：一个你我都知道的、关于你的四位数。</p>
      <p class="paper-plane-lock-status" id="paperPlanePasswordStatus" aria-live="polite"></p>
    </div>
    <div class="easter-egg-notes">
      <p class="easter-egg-notes-title">那就再留几句碎碎念吧。</p>
      <div class="easter-egg-notes-body">
        ${easterEggNotes
          .map((note, index) => `<p class="easter-egg-note" data-note-index="${index}">${escapeHtml(note)}</p>`)
          .join('')}
      </div>
    </div>
  `;
  stage.append(message);

  const firstLine = message.querySelector('.easter-egg-first');
  const secondLine = message.querySelector('.easter-egg-second');
  const lock = message.querySelector('.paper-plane-lock');
  const lockCopy = message.querySelector('.paper-plane-lock-copy');
  const lockForm = message.querySelector('.paper-plane-lock-form');
  const passwordInput = message.querySelector('.paper-plane-lock-input');
  const lockStatus = message.querySelector('.paper-plane-lock-status');
  requestAnimationFrame(() => firstLine?.classList.add('is-visible'));
  easterEggCopyTimers.push(
    window.setTimeout(
      () => secondLine?.classList.add('is-visible'),
      reduceMotion.matches ? 0 : 2200,
    ),
  );

  passwordInput?.addEventListener('input', () => {
    passwordInput.value = passwordInput.value.replace(/\D/g, '').slice(0, 4);
    if (!lockStatus?.textContent) return;
    lockStatus.classList.remove('is-visible');
    lockStatus.textContent = '';
  });

  lockForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    unlockPaperPlaneNotes(message);
  });

  const lockCopyStart = reduceMotion.matches ? 80 : 3400;
  const lockFormStart = reduceMotion.matches ? 140 : 4100;
  easterEggCopyTimers.push(
    window.setTimeout(() => {
      if (!message.isConnected) return;
      if (paperPlaneNotesUnlocked) {
        revealPaperPlaneNotes(message);
        return;
      }
      message.classList.add('is-locking');
      lockCopy?.classList.add('is-visible');
    }, lockCopyStart),
  );
  easterEggCopyTimers.push(
    window.setTimeout(() => {
      if (!message.isConnected || paperPlaneNotesUnlocked) return;
      lock?.classList.add('is-visible');
      lockForm?.classList.add('is-visible');
    }, lockFormStart),
  );
}

function unlockPaperPlaneNotes(message) {
  if (paperPlaneNotesUnlocked || !message?.isConnected) return;

  const input = message.querySelector('.paper-plane-lock-input');
  const form = message.querySelector('.paper-plane-lock-form');
  const status = message.querySelector('.paper-plane-lock-status');
  const lock = message.querySelector('.paper-plane-lock');
  if (!input || !form || !status || !lock) return;

  const value = input.value.replace(/\D/g, '').slice(0, 4);
  input.value = value;
  status.classList.remove('is-visible');
  if (value !== '1023') {
    status.textContent = '好像不是这个。';
    requestAnimationFrame(() => status.classList.add('is-visible'));
    return;
  }

  paperPlaneNotesUnlocked = true;
  [...form.elements].forEach((control) => { control.disabled = true; });
  status.textContent = '咔哒。好像打开了。';
  requestAnimationFrame(() => status.classList.add('is-visible'));
  easterEggCopyTimers.push(
    window.setTimeout(() => {
      if (!message.isConnected) return;
      lock.classList.add('is-unlocking');
      easterEggCopyTimers.push(
        window.setTimeout(() => {
          if (!message.isConnected) return;
          lock.hidden = true;
          revealPaperPlaneNotes(message);
        }, reduceMotion.matches ? 0 : 380),
      );
    }, 650),
  );
}

function revealPaperPlaneNotes(message) {
  if (!paperPlaneNotesUnlocked || !message?.isConnected || message.classList.contains('is-expanded')) return;

  const notesTitle = message.querySelector('.easter-egg-notes-title');
  const notes = [...message.querySelectorAll('.easter-egg-note')];
  message.classList.remove('is-locking');
  message.classList.add('is-expanded');
  dateApp?.classList.add('has-easter-egg-notes');
  notesTitle?.classList.add('is-visible');
  easterEggCopyTimers.push(
    window.setTimeout(
      () => message.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' }),
      reduceMotion.matches ? 0 : 160,
    ),
  );
  notes.forEach((note, index) => {
    easterEggCopyTimers.push(
      window.setTimeout(
        () => note.classList.add('is-visible'),
        reduceMotion.matches ? 120 + index * 70 : 520 + index * 420,
      ),
    );
  });
}

function animatePaperPlane(tapCount) {
  const planeButton = document.querySelector('.paper-plane-easter-egg');
  const plane = planeButton?.querySelector('.paper-plane-inner');
  if (!planeButton || !plane) return;

  plane.className = 'paper-plane-inner';
  void plane.offsetWidth;
  window.clearTimeout(paperPlaneFeedbackTimer);

  if (reduceMotion.matches) {
    if (tapCount === 5) {
      planeButton.classList.add('is-reduced-departing');
      return;
    }

    plane.classList.add('is-reduced-feedback');
    paperPlaneFeedbackTimer = window.setTimeout(
      () => plane.classList.remove('is-reduced-feedback'),
      120,
    );
    return;
  }

  plane.classList.add(`is-flight-${Math.min(tapCount, 5)}`);
  if (tapCount < 5) {
    const flightDurations = [0, 210, 220, 210, 230];
    paperPlaneFeedbackTimer = window.setTimeout(
      () => {
        if (!easterEggRevealed) plane.className = 'paper-plane-inner';
      },
      flightDurations[tapCount] + 20,
    );
  }
}

function bindEasterEgg() {
  document.querySelector('.paper-plane-easter-egg')?.addEventListener('click', triggerEasterEgg);
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
  stage.dataset.screen = screen.id;
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
  bindMusicRecords();

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
    <figure
      class="dog-stamp music-record"
      role="button"
      tabindex="0"
      aria-pressed="false"
      aria-label="播放《碎碎念》"
      title="播放 / 暂停《碎碎念》"
    >
      <span class="music-record-disc">
        <img
          class="sand-heart-image"
          src="assets/sand-heart-web.jpg"
          width="540"
          height="720"
          decoding="async"
          alt="沙地上的爱心"
        />
      </span>
    </figure>
    <div class="music-meta">
      <span class="music-hint" aria-live="polite">点一下，有首歌想给你听</span>
      <span class="music-meta-separator" aria-hidden="true" hidden>·</span>
      <button
        class="music-change-button"
        type="button"
        aria-expanded="false"
        aria-controls="musicTrackPicker"
        hidden
      >换一首</button>
    </div>
    <div class="music-track-picker" id="musicTrackPicker" aria-label="歌曲选择" hidden>
      ${renderMusicTrackPicker()}
    </div>
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
  if (
    event.pointerType === 'touch' ||
    state.noCount >= noMoves.length ||
    state.noSettling ||
    performance.now() < suppressNoButtonClickUntil
  ) {
    return;
  }

  if (dodgeNoButton(event.currentTarget)) {
    suppressNoButtonClickUntil = performance.now() + 360;
  }
}

function handleNoClick(event) {
  if (performance.now() < suppressNoButtonClickUntil) {
    event.preventDefault();
    suppressNoButtonClickUntil = 0;
    return;
  }

  if (state.noCount < noMoves.length) {
    event.preventDefault();
    dodgeNoButton(event.currentTarget);
    return;
  }

  if (!state.noSettling) showOutcome('decline');
}

function dodgeNoButton(button) {
  if (state.noCount >= noMoves.length || state.noSettling) return false;
  const move = noMoves[state.noCount];
  const startButton = card.querySelector('#startButton');
  const actions = button.parentElement;
  const cardRect = card.getBoundingClientRect();
  const actionsRect = actions.getBoundingClientRect();
  const safeMargin = Math.min(22, Math.max(16, cardRect.width * 0.04));
  const visualButtonWidth = button.offsetWidth * move.noScale;
  const visualButtonHeight = button.offsetHeight * move.noScale;
  const buttonCenterX = actionsRect.left + button.offsetLeft + button.offsetWidth / 2;
  const buttonCenterY = actionsRect.top + button.offsetTop + button.offsetHeight / 2;
  const minX = cardRect.left + safeMargin + visualButtonWidth / 2 - buttonCenterX;
  const maxX = cardRect.right - safeMargin - visualButtonWidth / 2 - buttonCenterX;
  const movementTop = Math.max(cardRect.top + safeMargin, actionsRect.top + 4);
  const movementBottom = Math.min(cardRect.bottom - safeMargin, actionsRect.bottom - 16);
  const minY = movementTop + visualButtonHeight / 2 - buttonCenterY;
  const maxY = movementBottom - visualButtonHeight / 2 - buttonCenterY;
  const safeX = minX <= maxX ? Math.max(minX, Math.min(maxX, move.x)) : 0;
  const safeY = minY <= maxY ? Math.max(minY, Math.min(maxY, move.y)) : 0;

  if (startButton) {
    const maxYesScale = Math.max(
      1,
      (cardRect.width - safeMargin * 2) / startButton.offsetWidth,
    );
    startButton.style.setProperty('--yes-scale', String(Math.min(move.yesScale, maxYesScale)));
  }

  button.style.setProperty('--no-scale', String(move.noScale));
  button.style.translate = `${safeX}px ${safeY}px`;
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
      suppressNoButtonClickUntil = 0;
      card.querySelector('#noNote').textContent = '好啦，这次不跑了。';
    }, 260);
  }

  return true;
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
    <figure
      class="dog-stamp corner-stamp music-record"
      role="button"
      tabindex="0"
      aria-pressed="false"
      aria-label="播放《碎碎念》"
      title="播放 / 暂停《碎碎念》"
    >
      <span class="music-record-disc">
        <img
          class="sand-heart-image"
          src="assets/sand-heart-web.jpg"
          width="540"
          height="720"
          decoding="async"
          alt=""
        />
      </span>
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
          <button class="result-card-button" id="saveResultCard" type="button">保存这次选择</button>
          <p class="result-card-status" id="resultCardStatus" role="status" aria-live="polite"></p>
          <button class="restart-button" id="restartInvitation" type="button">重新填写一次</button>
          <div class="success-epilogue" aria-live="off">
            <p class="success-epilogue-first">谢谢你愿意认真看到这里。</p>
            <p class="success-epilogue-second">能看到你一路走到这里，大概就是我做这个网页时最期待的事。</p>
          </div>
          <button class="final-note-button" id="openQixiFinal" type="button">还有一句</button>`
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
  card.querySelector('#saveResultCard')?.addEventListener('click', saveResultCard);
  card.querySelector('#restartInvitation')?.addEventListener('click', restartInvitation);
  card.querySelector('#openQixiFinal')?.addEventListener('click', openQixiFinal);
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
    stage.dataset.screen = 'outcome';
    card.className = 'invitation-card outcome-card';
    card.dataset.screen = 'outcome';
    card.innerHTML = `
      <div class="sprig-mark tall" aria-hidden="true"><i></i><i></i><i></i></div>
      ${outcome.eyebrow ? `<p class="eyebrow">${escapeHtml(outcome.eyebrow)}</p>` : ''}
      <h1 class="title">${escapeHtml(outcome.title)}</h1>
      ${outcome.detail ? `<p class="subtitle">${formatText(outcome.detail)}</p>` : ''}
      ${outcome.ending ? `<p class="outcome-ending">${escapeHtml(outcome.ending)}</p>` : ''}
      <figure
        class="dog-stamp outcome-stamp music-record"
        role="button"
        tabindex="0"
        aria-pressed="false"
        aria-label="播放《碎碎念》"
        title="播放 / 暂停《碎碎念》"
      >
        <span class="music-record-disc">
          <img
            class="sand-heart-image"
            src="assets/sand-heart-web.jpg"
            width="540"
            height="720"
            decoding="async"
            alt=""
          />
        </span>
      </figure>
    `;
    state.transitioning = false;
    bindMusicRecords();
    requestAnimationFrame(() => card.classList.add('is-entering'));
  }, 260);
}

bindEasterEgg();
bindQixiFinaleInteraction();
saveState();
render();
