/* GlowRoutine — interactive features: Save/Favorites, Compare, Checklist, Newsletter */
(function(){
  var LS_FAV = 'glow_favorites_v1';
  var LS_BOUGHT = 'glow_bought_v1';

  function safeParse(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e){ return fallback; }
  }
  function safeSet(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){}
  }

  function getFavorites(){ return safeParse(LS_FAV, []); }
  function setFavorites(list){ safeSet(LS_FAV, list); }
  function isFavorited(id){
    return getFavorites().some(function(f){ return f.id === id; });
  }
  function toggleFavorite(item){
    var list = getFavorites();
    var idx = -1;
    for (var i=0;i<list.length;i++){ if (list[i].id === item.id){ idx = i; break; } }
    if (idx === -1){ list.push(item); } else { list.splice(idx,1); }
    setFavorites(list);
    return idx === -1;
  }

  /* ---------- Extract products from a category page ---------- */
  function extractPageProducts(){
    var rows = document.querySelectorAll('.compare-table tr');
    var buyRows = document.querySelectorAll('main .buy-row');
    var products = [];
    for (var i = 1; i < rows.length; i++){
      var tds = rows[i].querySelectorAll('td');
      if (tds.length < 3) continue;
      var name = tds[0].textContent.trim();
      var tierEl = tds[1].querySelector('.mini-tag');
      var tierText = tierEl ? tierEl.textContent.trim() : '';
      var tierClass = 'mid';
      if (tierEl){
        if (tierEl.className.indexOf('low') !== -1) tierClass = 'low';
        else if (tierEl.className.indexOf('high') !== -1) tierClass = 'high';
        else tierClass = 'mid';
      }
      var bestFor = tds[2].textContent.trim();
      var buyRow = buyRows[i-1];
      var link = buyRow ? buyRow.querySelector('a.buy-btn') : null;
      products.push({
        idx: i-1,
        name: name,
        tier: tierText,
        tierClass: tierClass,
        bestFor: bestFor,
        buyLink: link ? link.href : '',
        buyRowEl: buyRow
      });
    }
    return products;
  }

  function pageMeta(){
    var h1 = document.querySelector('main h1');
    var metaEl = document.querySelector('.meta');
    return {
      pageUrl: window.location.pathname.split('/').pop() || 'index.html',
      pageTitle: h1 ? h1.textContent.trim() : document.title,
      group: metaEl ? metaEl.textContent.trim() : ''
    };
  }

  /* ---------- Favorites buttons on category pages ---------- */
  function initFavoriteButtons(){
    var products = extractPageProducts();
    if (!products.length) return;
    var meta = pageMeta();
    products.forEach(function(p){
      if (!p.buyRowEl) return;
      var id = meta.pageUrl + '#' + p.idx;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fav-btn';
      btn.setAttribute('aria-label', 'Save this pick');
      function render(){
        var fav = isFavorited(id);
        btn.innerHTML = fav ? '&#9829; Saved' : '&#9825; Save';
        btn.classList.toggle('is-fav', fav);
      }
      render();
      btn.addEventListener('click', function(){
        toggleFavorite({
          id: id, name: p.name, tier: p.tier, tierClass: p.tierClass,
          bestFor: p.bestFor, buyLink: p.buyLink,
          pageUrl: meta.pageUrl, pageTitle: meta.pageTitle, group: meta.group
        });
        render();
      });
      p.buyRowEl.insertBefore(btn, p.buyRowEl.firstChild);
    });
  }

  /* ---------- Comparator on category pages ---------- */
  var compareSelected = [];
  function initComparator(){
    var products = extractPageProducts();
    if (products.length < 2) return;

    var bar = document.createElement('div');
    bar.className = 'compare-bar';
    bar.innerHTML = '<span class="compare-bar-label"></span>' +
      '<button type="button" class="compare-bar-btn">Compare &#8594;</button>' +
      '<button type="button" class="compare-bar-clear">Clear</button>';
    document.body.appendChild(bar);
    var label = bar.querySelector('.compare-bar-label');
    var openBtn = bar.querySelector('.compare-bar-btn');
    var clearBtn = bar.querySelector('.compare-bar-clear');
    var checkboxes = [];

    function updateBar(){
      if (compareSelected.length >= 2){
        bar.classList.add('open');
        label.textContent = compareSelected.length + ' selected';
      } else {
        bar.classList.remove('open');
      }
    }

    products.forEach(function(p){
      if (!p.buyRowEl) return;
      var wrap = document.createElement('label');
      wrap.className = 'compare-check-wrap';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'compare-check';
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode('Compare'));
      cb.addEventListener('change', function(){
        if (cb.checked){
          if (compareSelected.length >= 3){
            cb.checked = false;
            return;
          }
          compareSelected.push(p);
        } else {
          compareSelected = compareSelected.filter(function(x){ return x !== p; });
        }
        updateBar();
      });
      checkboxes.push(cb);
      p.buyRowEl.appendChild(wrap);
    });

    openBtn.addEventListener('click', function(){
      showCompareModal();
    });
    clearBtn.addEventListener('click', function(){
      compareSelected = [];
      checkboxes.forEach(function(cb){ cb.checked = false; });
      updateBar();
    });
  }

  function showCompareModal(){
    var existing = document.querySelector('.compare-modal-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'compare-modal-overlay';
    var cols = compareSelected.map(function(p){
      return '<div class="compare-col">' +
        '<span class="mini-tag ' + p.tierClass + '">' + p.tier + '</span>' +
        '<h4>' + p.name + '</h4>' +
        '<p>' + p.bestFor + '</p>' +
        '<a class="buy-btn" href="' + p.buyLink + '" target="_blank" rel="nofollow sponsored noopener">Check price on Amazon &#8594;</a>' +
      '</div>';
    }).join('');
    overlay.innerHTML = '<div class="compare-modal">' +
      '<button type="button" class="compare-modal-close" aria-label="Close">&times;</button>' +
      '<h3>Compare picks</h3>' +
      '<div class="compare-cols">' + cols + '</div>' +
    '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.compare-modal-close').addEventListener('click', function(){ overlay.remove(); });
  }

  /* ---------- Checklist on planner results (called externally after render) ---------- */
  function getBought(){ return safeParse(LS_BOUGHT, {}); }
  function setBought(obj){ safeSet(LS_BOUGHT, obj); }
  function initChecklistForGrid(gridEl){
    if (!gridEl) return;
    var bought = getBought();
    var cards = gridEl.querySelectorAll('.plan-card');
    cards.forEach(function(card){
      var slug = card.getAttribute('data-slug');
      if (!slug) return;
      var wrap = document.createElement('label');
      wrap.className = 'plan-check-wrap';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!bought[slug];
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode('Already got this'));
      function applyState(){
        card.classList.toggle('is-bought', cb.checked);
      }
      applyState();
      cb.addEventListener('change', function(){
        var b = getBought();
        if (cb.checked) b[slug] = true; else delete b[slug];
        setBought(b);
        applyState();
      });
      var body = card.querySelector('.plan-card-body');
      if (body) body.appendChild(wrap);
    });
  }

  /* ---------- Favorites page rendering ---------- */
  function renderFavoritesPage(){
    var container = document.getElementById('favorites-list');
    if (!container) return;
    var list = getFavorites();
    var emptyEl = document.getElementById('favorites-empty');
    if (!list.length){
      if (emptyEl) emptyEl.style.display = 'block';
      container.innerHTML = '';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    container.innerHTML = list.map(function(f){
      return '<div class="fav-card">' +
        '<span class="mini-tag ' + f.tierClass + '">' + f.tier + '</span>' +
        '<h4>' + f.name + '</h4>' +
        '<p class="fav-context">' + f.bestFor + '</p>' +
        '<p class="fav-source">From: <a href="' + f.pageUrl + '">' + f.pageTitle + '</a></p>' +
        '<div class="fav-card-actions">' +
          '<a class="buy-btn" href="' + f.buyLink + '" target="_blank" rel="nofollow sponsored noopener">Check price &#8594;</a>' +
          '<button type="button" class="fav-remove" data-id="' + f.id + '">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');
    Array.prototype.forEach.call(container.querySelectorAll('.fav-remove'), function(btn){
      btn.addEventListener('click', function(){
        var list2 = getFavorites().filter(function(f){ return f.id !== btn.getAttribute('data-id'); });
        setFavorites(list2);
        renderFavoritesPage();
      });
    });
  }

  /* ---------- Newsletter form (fetch-based, stays on page) ---------- */
  function initNewsletterForms(){
    var forms = document.querySelectorAll('.newsletter-form');
    Array.prototype.forEach.call(forms, function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var msgEl = form.parentNode.querySelector('.newsletter-msg');
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';
        var formData = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).then(function(res){
          if (res.ok){
            if (msgEl) msgEl.textContent = "You're on the list — thank you!";
            form.reset();
          } else {
            if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
          }
        }).catch(function(){
          if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
        }).then(function(){
          btn.disabled = false;
          btn.textContent = originalText;
        });
      });
    });
  }

  /* ---------- Contact form (About page, fetch-based, stays on page) ---------- */
  function initContactForms(){
    var forms = document.querySelectorAll('.contact-form');
    Array.prototype.forEach.call(forms, function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var msgEl = form.parentNode.querySelector('.contact-msg');
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';
        var formData = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).then(function(res){
          if (res.ok){
            if (msgEl) msgEl.textContent = "Message sent — thank you! We'll get back to you soon.";
            form.reset();
          } else {
            if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
          }
        }).catch(function(){
          if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
        }).then(function(){
          btn.disabled = false;
          btn.textContent = originalText;
        });
      });
    });
  }

  function initHeroWaveSm(){
    var canvases = document.querySelectorAll('.hero-wave-sm');
    if(!canvases.length) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var colors = ['#fff6e6', '#ffe3bd', '#ffd49a', '#ffffff', '#fff1d6'];
    // Glow via pre-rendered sprites (drawImage) instead of ctx.shadowBlur per
    // shape, which is expensive to recompute every particle every frame and
    // was the cause of the stutter.
    function hexToRgb(hex){
      hex = hex.replace('#', '');
      return parseInt(hex.substring(0,2),16) + ',' + parseInt(hex.substring(2,4),16) + ',' + parseInt(hex.substring(4,6),16);
    }
    function makeSprite(color){
      var s = 64;
      var c = document.createElement('canvas');
      c.width = s; c.height = s;
      var sctx = c.getContext('2d');
      var rgb = hexToRgb(color);
      var g = sctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
      g.addColorStop(0, 'rgba(' + rgb + ',1)');
      g.addColorStop(0.35, 'rgba(' + rgb + ',0.85)');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      sctx.fillStyle = g;
      sctx.beginPath();
      sctx.arc(s/2, s/2, s/2, 0, Math.PI * 2);
      sctx.fill();
      return c;
    }
    var sprites = {};
    colors.forEach(function(c){ sprites[c] = makeSprite(c); });

    canvases.forEach(function(canvas){
      if(!canvas.getContext) return;
      var ctx = canvas.getContext('2d');
      var w = 0, h = 0, dpr = 1, band, particles, orbs, bandHalfWidth;
      function rand(min, max){ return min + Math.random() * (max - min); }
      function randG(){ return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
      function resize(){
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var rect = canvas.getBoundingClientRect();
        w = rect.width; h = rect.height;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function buildBand(){
        band = {
          amp: h * 0.16,
          cycles: rand(0.9, 1.3),
          phase: rand(0, Math.PI * 2),
          speed: 0.32,
          baseY: h * 0.52,
          driftAmp: h * 0.1,
          driftSpeed: rand(0.11, 0.17),
          driftPhase: rand(0, Math.PI * 2),
          k2: rand(0.7, 1.6),
          k2phase: rand(0, Math.PI * 2)
        };
      }
      function centerY(x, t){
        var k = band.cycles * Math.PI * 2 / w;
        return band.baseY
          + Math.sin(x * k + band.phase + t * band.speed) * band.amp
          + Math.sin(t * band.driftSpeed + band.driftPhase) * band.driftAmp;
      }
      function thickness(x, t){
        var k2 = band.k2 * Math.PI * 2 / w;
        return 0.55 + 0.45 * Math.sin(x * k2 + band.k2phase + t * 0.2);
      }
      function buildParticles(){
        bandHalfWidth = h * 0.27;
        particles = [];
        var count = Math.max(100, Math.round((w * h) / 2500));
        for (var i = 0; i < count; i++) {
          particles.push({
            u: Math.random(),
            speed: rand(22, 70),
            offset: randG() * bandHalfWidth,
            wobbleAmp: rand(2, 7),
            wobbleSpeed: rand(0.4, 1.1),
            wobblePhase: rand(0, Math.PI * 2),
            size: rand(0.7, 1.9),
            color: colors[Math.floor(Math.random() * colors.length)],
            alphaMax: rand(0.5, 0.95)
          });
        }
        orbs = [];
        var ocount = Math.max(4, Math.round(w / 220));
        for (var j = 0; j < ocount; j++) {
          orbs.push({
            u: Math.random(),
            speed: rand(10, 22),
            offset: randG() * bandHalfWidth * 0.7,
            size: rand(4, 7.5),
            color: colors[Math.floor(Math.random() * colors.length)],
            alphaMax: rand(0.3, 0.55),
            wobbleAmp: rand(3, 7),
            wobbleSpeed: rand(0.2, 0.5),
            wobblePhase: rand(0, Math.PI * 2)
          });
        }
      }
      resize();
      buildBand();
      buildParticles();
      window.addEventListener('resize', function(){ resize(); buildBand(); buildParticles(); });

      function edgeFade(u){
        var e = 0.06;
        if (u < e) return u / e;
        if (u > 1 - e) return (1 - u) / e;
        return 1;
      }

      var time = 0, lastT = null;
      function frame(ts){
        if (w === 0 || h === 0) { if (!reduceMotion) requestAnimationFrame(frame); return; }
        if (lastT === null) lastT = ts;
        var dt = Math.min((ts - lastT) / 1000, 0.05);
        lastT = ts;
        ctx.clearRect(0, 0, w, h);

        // No dark backdrop drawn here — the photo stays at its original color.
        // Only the glowing particles/orbs are drawn, additively, directly over it.
        ctx.globalCompositeOperation = 'lighter';

        for (var oi = 0; oi < orbs.length; oi++) {
          var o = orbs[oi];
          if (!reduceMotion) { o.u += o.speed * dt / w; if (o.u > 1) o.u -= 1; }
          var ox = o.u * w;
          var oy = centerY(ox, time) + o.offset + (reduceMotion ? 0 : Math.sin(time * o.wobbleSpeed + o.wobblePhase) * o.wobbleAmp);
          var oAlpha = o.alphaMax * edgeFade(o.u);
          if (oAlpha <= 0.02) continue;
          var or = o.size * 2.4;
          ctx.globalAlpha = oAlpha;
          ctx.drawImage(sprites[o.color], ox - or, oy - or, or * 2, or * 2);
        }

        for (var i = 0; i < particles.length; i++) {
          var pt = particles[i];
          if (!reduceMotion) { pt.u += pt.speed * dt / w; if (pt.u > 1) pt.u -= 1; }
          var x = pt.u * w;
          var th = thickness(x, time);
          var y = centerY(x, time) + pt.offset * th + (reduceMotion ? 0 : Math.sin(time * pt.wobbleSpeed + pt.wobblePhase) * pt.wobbleAmp);
          var twinkle = reduceMotion ? 1 : (0.7 + 0.3 * Math.sin(time * 2.4 + pt.wobblePhase * 3));
          var alpha = pt.alphaMax * edgeFade(pt.u) * twinkle;
          if (alpha <= 0.03) continue;
          var pr = pt.size * 2.8;
          ctx.globalAlpha = alpha;
          ctx.drawImage(sprites[pt.color], x - pr, y - pr, pr * 2, pr * 2);
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        if (!reduceMotion) time += dt;
        if (!reduceMotion) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initFavoriteButtons();
    initComparator();
    renderFavoritesPage();
    initNewsletterForms();
    initContactForms();
    initHeroWaveSm();
  });

  window.GlowTools = {
    initChecklistForGrid: initChecklistForGrid
  };
})();
