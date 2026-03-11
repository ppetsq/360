{
  const canvas = document.getElementById('grain');
  const ctx    = canvas.getContext('2d');

  function resizeGrain() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeGrain();
  window.addEventListener('resize', resizeGrain);

  let lastGrain = 0;
  let grainRafId;

  function drawGrain(ts) {
    if (ts - lastGrain > 50) {
      lastGrain = ts;
      const id   = ctx.createImageData(canvas.width, canvas.height);
      const data = id.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255 | 0;
        data[i] = data[i+1] = data[i+2] = v;
        data[i+3] = 8;
      }
      ctx.putImageData(id, 0, 0);
    }
    grainRafId = requestAnimationFrame(drawGrain);
  }

  grainRafId = requestAnimationFrame(drawGrain);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(grainRafId);
    else grainRafId = requestAnimationFrame(drawGrain);
  });
}
