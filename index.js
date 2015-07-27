(function(){
  var width, height, cols, rows, x0$, ctx, r, write, res$, i, zero, res1$, chars, res2$, step;
  width = this.innerWidth, height = this.innerHeight;
  cols = width / 10 | 0;
  rows = height / 10 | 0;
  importAll$(canvas, {
    width: width,
    height: height
  });
  x0$ = ctx = canvas.getContext('2d');
  x0$.translate(width, 0);
  x0$.scale(-1, 1);
  r = Math.random;
  res$ = [];
  for (i = 0; i < cols; ++i) {
    res$.push(r() * 2 * rows | 0);
  }
  write = res$;
  res1$ = [];
  for (i = 0; i < cols; ++i) {
    res1$.push(r() * 2 * rows | 0);
  }
  zero = res1$;
  res2$ = [];
  for (i = 0; i < cols; ++i) {
    res2$.push('');
  }
  chars = res2$;
  step = function(){
    var res$, x, len$, y, c;
    ctx.fillStyle = '#000';
    res$ = [];
    for (x = 0, len$ = zero.length; x < len$; ++x) {
      y = zero[x];
      ctx.fillRect(x * 10, (y - 1) * 10, 10, 10);
      if (r() * rows | 0) {
        res$.push((y + 1) % (2 * rows));
      } else {
        res$.push(r() * 2 * rows | 0);
      }
    }
    zero = res$;
    return write = (function(){
      var ref$, len$, x1$, x2$, results$ = [];
      for (x = 0, len$ = (ref$ = write).length; x < len$; ++x) {
        y = ref$[x];
        c = String.fromCharCode(12448 + r() * 96);
        x1$ = ctx;
        x1$.fillStyle = '#0f0';
        x1$.fillText(chars[x], x * 10, (y - 1) * 10);
        chars[x] = c;
        if (r() * rows | 0) {
          x2$ = ctx;
          x2$.fillStyle = '#000';
          x2$.fillRect(x * 10, (y - 1) * 10, 10, 10);
          x2$.fillStyle = '#afa';
          x2$.fillText(c, x * 10, y * 10);
          results$.push((y + 1) % (2 * rows));
        } else {
          results$.push(r() * 2 * rows | 0);
        }
      }
      return results$;
    }());
  };
  setInterval(step, 33);
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
}).call(this);