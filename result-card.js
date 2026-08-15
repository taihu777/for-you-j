(function createResultCardModule() {
  const CARD_WIDTH = 1080;
  const CARD_HEIGHT = 1440;
  const FONT_FAMILY = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

  function setFont(context, size, weight = 500) {
    context.font = `${weight} ${size}px ${FONT_FAMILY}`;
  }

  function drawRule(context, y) {
    context.beginPath();
    context.moveTo(132, y + 0.5);
    context.lineTo(948, y + 0.5);
    context.strokeStyle = 'rgba(38, 52, 45, 0.2)';
    context.lineWidth = 2;
    context.stroke();
  }

  function drawSprig(context, x, y) {
    context.save();
    context.translate(x, y);
    context.strokeStyle = '#728a76';
    context.lineWidth = 4;
    context.lineCap = 'round';

    context.beginPath();
    context.moveTo(-28, 34);
    context.quadraticCurveTo(0, 9, 22, -38);
    context.stroke();

    [
      { x: -14, y: 19, rotate: -2.45 },
      { x: 1, y: -4, rotate: -0.58 },
      { x: 14, y: -28, rotate: -2.35 },
    ].forEach((leaf) => {
      context.save();
      context.translate(leaf.x, leaf.y);
      context.rotate(leaf.rotate);
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(7, -9, 18, -10, 23, 0);
      context.bezierCurveTo(15, 7, 6, 6, 0, 0);
      context.stroke();
      context.restore();
    });
    context.restore();
  }

  function drawPaper(context) {
    context.fillStyle = '#f8f3e9';
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const light = context.createRadialGradient(170, 120, 10, 170, 120, 840);
    light.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    light.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = light;
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    context.strokeStyle = 'rgba(68, 58, 44, 0.14)';
    context.lineWidth = 2;
    context.strokeRect(19, 19, CARD_WIDTH - 38, CARD_HEIGHT - 38);

    context.fillStyle = 'rgba(69, 58, 43, 0.025)';
    for (let y = 34; y < CARD_HEIGHT; y += 19) {
      context.fillRect(28, y, CARD_WIDTH - 56, 1);
    }
  }

  function createCanvas(data) {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法创建结果图片。');

    drawPaper(context);
    context.textBaseline = 'alphabetic';

    context.fillStyle = '#728a76';
    setFont(context, 30, 700);
    context.fillText('这次的选择', 132, 160);
    context.fillRect(132, 186, 54, 3);

    context.fillStyle = '#26342d';
    setFont(context, 70, 800);
    context.fillText('如果那天真的有空', 132, 286);

    context.fillStyle = '#728a76';
    setFont(context, 28, 700);
    context.fillText('先去', 132, 424);
    context.fillStyle = '#26342d';
    setFont(context, 52, 800);
    context.fillText(String(data.primaryActivity || ''), 132, 494);
    context.fillStyle = '#5f6e66';
    setFont(context, 28, 520);
    context.fillText(String(data.primaryPreference || ''), 132, 548);

    drawRule(context, 614);

    context.fillStyle = '#728a76';
    setFont(context, 28, 700);
    context.fillText('接下来', 132, 704);
    context.fillStyle = '#26342d';
    setFont(context, 52, 800);
    context.fillText(String(data.secondaryActivity || ''), 132, 774);
    context.fillStyle = '#5f6e66';
    setFont(context, 28, 520);
    context.fillText(String(data.secondaryPreference || ''), 132, 828);

    drawRule(context, 894);

    context.textAlign = 'center';
    context.fillStyle = '#26342d';
    setFont(context, 31, 620);
    context.fillText(`邀请回答 · ${String(data.invitationResponse || '')}`, CARD_WIDTH / 2, 986);

    context.fillStyle = '#728a76';
    setFont(context, 34, 680);
    context.fillText(String(data.ending || ''), CARD_WIDTH / 2, 1092);

    drawSprig(context, CARD_WIDTH / 2, 1211);
    context.fillStyle = 'rgba(38, 52, 45, 0.58)';
    setFont(context, 24, 520);
    context.fillText('留给这次可能的见面', CARD_WIDTH / 2, 1328);

    return canvas;
  }

  function createPngBlob(data) {
    const canvas = createCanvas(data);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('无法生成结果图片。'));
      }, 'image/png');
    });
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function prefersFileShare() {
    return (
      window.matchMedia?.('(pointer: coarse)').matches === true || navigator.maxTouchPoints > 0
    );
  }

  async function save(data) {
    const blob = await createPngBlob(data);
    const fileName = '这次的选择.png';
    const file = typeof File === 'function' ? new File([blob], fileName, { type: 'image/png' }) : null;

    let canShareFile = false;
    try {
      canShareFile =
        prefersFileShare() &&
        Boolean(file) &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });
    } catch {
      canShareFile = false;
    }

    if (canShareFile) {
      try {
        await navigator.share({
          files: [file],
          title: '这次的选择',
          text: '把这次的选择留一下。',
        });
        return { method: 'share' };
      } catch (error) {
        if (error?.name === 'AbortError') return { method: 'cancelled' };
      }
    }

    downloadBlob(blob, fileName);
    return { method: 'download' };
  }

  window.DateInvitationResultCard = Object.freeze({ createCanvas, createPngBlob, save });
})();
