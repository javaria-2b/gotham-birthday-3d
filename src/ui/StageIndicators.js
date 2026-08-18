import { STAGES } from '../utils/Constants.js';

/**
 * Reads ?name= from URL params for personalization.
 * Falls back to generic greeting if not provided.
 */
function getBirthdayName() {
  const params = new URLSearchParams(window.location.search);
  return params.get('name') || null;
}

export class StageIndicators {
  constructor(scrollController) {
    this.sc = scrollController;
    this.birthdayName = getBirthdayName();
    this.stageNames = [
      'HAPPY BIRTHDAY',
      'THE SIGNAL IGNITES',
      'THE CITY',
      'THE HUNT',
      'THE NIGHT',
    ];

    this._createHeroTitle();
    this._createBirthdaySubtitle();
    this._createStageSubtitle();
    this._createDotNav();
    this._createScrollIndicator();
    this._createCTA();

    this.sc.onStageChange((s) => this._onStageChange(s));
    this._onStageChange(0);

    // Entrance animation after load
    setTimeout(() => {
      this.heroTitle.classList.add('entrance');
      this.birthdaySub.classList.add('entrance');
    }, 400);

    this.heroTitle.addEventListener('animationend', () => {
      this.heroTitle.classList.remove('entrance');
      this.heroTitle.style.opacity = '1';
      this.heroTitle.style.transform = 'translateX(-50%) translateY(0)';
    });

    this.birthdaySub.addEventListener('animationend', () => {
      this.birthdaySub.classList.remove('entrance');
      this.birthdaySub.style.opacity = '0.9';
      this.birthdaySub.style.transform = 'translateX(-50%) translateY(0)';
    });
  }

  _createHeroTitle() {
    this.heroTitle = document.createElement('h1');
    this.heroTitle.className = 'hero-title birthday-title';
    // Personalize if name provided
    if (this.birthdayName) {
      this.heroTitle.innerHTML = `HAPPY BIRTHDAY<br><span style="font-size:1.3em;">${this._escape(this.birthdayName).toUpperCase()}</span>`;
      this.heroTitle.style.lineHeight = '1.15';
    } else {
      this.heroTitle.textContent = 'HAPPY BIRTHDAY';
    }
    this.heroTitle.style.cssText += 'font-size:clamp(2.2rem,5.5vw,5.5rem);opacity:0;transform:translateX(-50%) translateY(20px);';
    document.getElementById('ui-layer').appendChild(this.heroTitle);
  }

  _escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _createBirthdaySubtitle() {
    this.birthdaySub = document.createElement('p');
    this.birthdaySub.className = 'stage-subtitle birthday-sub';
    this.birthdaySub.textContent = this.birthdayName
      ? `BATMAN WISHES YOU — FROM GOTHAM 🦇`
      : 'FROM GOTHAM WITH LOVEE 🦇';
    this.birthdaySub.style.cssText = 'bottom:20%;color:var(--color-ui-gold);font-size:clamp(0.7rem,1.5vw,1rem);opacity:0;transform:translateX(-50%) translateY(10px);';
    document.getElementById('ui-layer').appendChild(this.birthdaySub);
  }

  _createStageSubtitle() {
    this.subtitle = document.createElement('p');
    this.subtitle.className = 'stage-subtitle';
    this.subtitle.style.bottom = '15%';
    document.getElementById('ui-layer').appendChild(this.subtitle);
  }

  _createDotNav() {
    const c = document.createElement('div'); c.className = 'stage-dots';
    this.dots = [];
    for (let i = 0; i < 5; i++) {
      const d = document.createElement('button'); d.className = 'stage-dot';
      d.setAttribute('aria-label', `Stage ${i + 1}`);
      d.addEventListener('click', () => this.sc.goToStage(i));
      c.appendChild(d); this.dots.push(d);
    }
    document.getElementById('ui-layer').appendChild(c);
  }

  _createScrollIndicator() {
    const c = document.createElement('div'); c.className = 'scroll-indicator';
    const l = document.createElement('div'); l.className = 'scroll-line'; c.appendChild(l);
    const v = document.createElement('div'); v.className = 'scroll-chevron'; c.appendChild(v);
    document.getElementById('ui-layer').appendChild(c);
    this.scrollIndicator = c;
    window.addEventListener('wheel', () => c.classList.add('hidden'), { once: true });
  }

  _createCTA() {
    this.cta = document.createElement('button');
    this.cta.className = 'cta-button';
    this.cta.textContent = 'SHARE THIS MOMENT';
    this.cta.addEventListener('click', () => this._share());
    document.getElementById('ui-layer').appendChild(this.cta);
  }

  async _share() {
    const url = new URL(window.location.href);
    if (this.birthdayName) url.searchParams.set('name', this.birthdayName);
    const shareUrl = url.toString();
    const nameStr = this.birthdayName ? ` ${this.birthdayName}` : '';

    const data = {
      title: `Happy Birthday${nameStr} — From Gotham 🦇`,
      text: `Batman sent${nameStr} a birthday surprise from Gotham City. 🦇🎂`,
      url: shareUrl,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(shareUrl); this._toast('Link copied! 🦇'); }
    } catch (_) {
      try { await navigator.clipboard.writeText(shareUrl); this._toast('Link copied!'); }
      catch (__) { this._toast(shareUrl); }
    }
  }

  _toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.getElementById('ui-layer').appendChild(t); }
    t.textContent = msg; t.classList.add('visible');
    setTimeout(() => t.classList.remove('visible'), 2000);
  }

  _onStageChange(stage) {
    this.subtitle.textContent = this.stageNames[stage];
    this.birthdaySub.style.opacity = stage === 0 ? '0.9' : '0';
    this.subtitle.style.opacity = stage >= 1 ? '0.8' : '0';
    this.dots.forEach((d, i) => d.classList.toggle('active', i === stage));
    if (stage === 4) { this.cta.style.opacity = '1'; this.cta.style.pointerEvents = 'auto'; }
    else { this.cta.style.opacity = '0'; this.cta.style.pointerEvents = 'none'; }
  }

  update() {
    const p = this.sc.getProgress();
    if (p < STAGES.BIRTHDAY.end) this.heroTitle.style.opacity = '1';
    else if (p < STAGES.HERO.end) this.heroTitle.style.opacity = Math.max(0, 1 - (p - STAGES.BIRTHDAY.end) / (STAGES.HERO.end - STAGES.BIRTHDAY.end)).toString();
    else this.heroTitle.style.opacity = '0';

    if (p < STAGES.BIRTHDAY.end) this.birthdaySub.style.opacity = '0.9';
    else if (p < STAGES.HERO.end) this.birthdaySub.style.opacity = Math.max(0, 1 - (p - STAGES.BIRTHDAY.end) / (STAGES.HERO.end - STAGES.BIRTHDAY.end)).toString();
    else this.birthdaySub.style.opacity = '0';
  }
}
