// ─── ВРЕМЯ ───
function updateTime() {
  const now = new Date();
  const fmt = (d) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
  const vkv = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const msk = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
  );
  const vkvStr = `UTC: ${fmt(vkv)}`;
  const mskStr = `МСК: ${fmt(msk)}`;

  ['timeVKV', 'timeVKV2', 'timeVKV3'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = vkvStr;
  });
  ['timeMSK', 'timeMSK2', 'timeMSK3'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = mskStr;
  });
}
