(function(){'use strict';

/* ================= CONFIG ================= */
const AppConfig=window.__APP_CONFIG__||{carouselInterval:5000,counterAnimationDuration:2500,loadingDuration:1500,web3FormsAccessKey:"f172d582-f61e-4dc1-ac3a-c144e252b0dd"};

/* ================= UTILS ================= */
const Utils={
  $(s,c=document){return c.querySelector(s)},
  $$(s,c=document){return c.querySelectorAll(s)},

  animateNumber(el,target,duration=2000){
    const start=+el.textContent.replace(/\D/g,'')||0;
    const change=target-start;
    const suffix=el.dataset.suffix||'';
    const startTime=performance.now();
    const animate=time=>{
      const p=Math.min((time-startTime)/duration,1);
      el.textContent=Math.floor(start+change*(1-Math.pow(1-p,3)))+suffix;
      if(p<1)requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },

  createObserver(cb,options={}){
    return new IntersectionObserver(cb,Object.assign({threshold:.15,rootMargin:'0px 0px -40px 0px'},options));
  },

  getTheme(){return localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')},
  setTheme(theme){document.documentElement.dataset.colorScheme=theme;localStorage.setItem('theme',theme)}
};

/* ================= LOADING ================= */
const LoadingScreen={init(){const el=Utils.$('#loading-screen');if(!el)return;setTimeout(()=>{el.classList.add('hidden');el.remove();},AppConfig.loadingDuration)}};

/* ================= NAVIGATION ================= */
const Navigation={
  init(){
    const header=Utils.$('#header');
    const navMenu=Utils.$('#nav-menu');
    if(!header||!navMenu)return;

    Utils.$('#nav-toggle')?.addEventListener('click',()=>navMenu.classList.add('show-menu'));
    Utils.$('#nav-close')?.addEventListener('click',()=>navMenu.classList.remove('show-menu'));

    navMenu.addEventListener('click',e=>{
      const link=e.target.closest('.nav__link');
      if(!link)return;
      navMenu.classList.remove('show-menu');
      const id=link.getAttribute('href');
      if(id?.startsWith('#')){
        e.preventDefault();
        const target=Utils.$(id);
        target&&window.scrollTo({top:target.offsetTop-header.offsetHeight,behavior:'smooth'});
      }
    });

    let ticking=false;
    const links=[...Utils.$$('.nav__link')];
    const sections=[...Utils.$$('section[id]')];

    window.addEventListener('scroll',()=>{
      if(ticking)return;
      ticking=true;
      requestAnimationFrame(()=>{
        header.classList.toggle('scrolled',scrollY>50);
        let current='';
        sections.forEach(sec=>{if(sec.getBoundingClientRect().top<header.offsetHeight+60)current=sec.id});
        links.forEach(l=>l.classList.toggle('active-link',l.getAttribute('href')===`#${current}`));
        ticking=false;
      });
    },{passive:true});
  }
};

/* ================= THEME ================= */
const ThemeToggle={init(){const btn=Utils.$('#theme-toggle');const icon=Utils.$('.theme-toggle__icon');if(!btn)return;const apply=t=>{Utils.setTheme(t);icon&&(icon.textContent=t==='dark'?'☀️':'🌙')};btn.addEventListener('click',()=>apply(Utils.getTheme()==='dark'?'light':'dark'));apply(Utils.getTheme())}};

/* ================= STATS ================= */
const StatsCounter={init(){const section=Utils.$('.hero__stats');if(!section)return;const nums=[...Utils.$$('.stat-card__number[data-target]')];if(!nums.length)return;const obs=Utils.createObserver(entries=>{if(entries[0].isIntersecting){nums.forEach((el,i)=>setTimeout(()=>Utils.animateNumber(el,+el.dataset.target,AppConfig.counterAnimationDuration),i*120));obs.disconnect()}},{threshold:.7});obs.observe(section)}};

/* ================= SWIPER ================= */
const SwiperCarousels={init(){if(typeof Swiper==='undefined')return;document.querySelectorAll('.team-carousel,.clients-carousel').forEach(el=>{if(el.classList.contains('swiper-initialized'))return;const isTeam=el.classList.contains('team-carousel');new Swiper(el,{loop:true,grabCursor:true,spaceBetween:30,autoplay:isTeam?false:{delay:3000,disableOnInteraction:false},navigation:isTeam?{nextEl:'.team-carousel-button-next',prevEl:'.team-carousel-button-prev'}:undefined,pagination:{el:el.querySelector('.swiper-pagination'),clickable:true},breakpoints:isTeam?{320:{slidesPerView:1},768:{slidesPerView:2},1024:{slidesPerView:3}}:{320:{slidesPerView:1},480:{slidesPerView:2},768:{slidesPerView:3},1024:{slidesPerView:4}}});})}};

/* ================= NOTABLE CASES + SEARCH ================= */
const CasesModule={
  init(){
    const filters=[...Utils.$$('.case-filter')];
    const cards=[...Utils.$$('.case-card')];
    const input=Utils.$('#caseSearch');
    if(!cards.length)return;

    filters.forEach(f=>f.addEventListener('click',()=>{
      filters.forEach(x=>x.classList.remove('active'));
      f.classList.add('active');
      const cat=f.dataset.filter;
      cards.forEach(c=>c.hidden=!(cat==='all'||c.dataset.category===cat));
    }));

    input?.addEventListener('input',()=>{
      const q=input.value.toLowerCase();
      cards.forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(q));
    });
  }
};

/* ================= FORMS ================= */
const FormHandler={
  init(){document.addEventListener('submit',e=>{const form=e.target.closest('#consultation-form,#contact-form');if(!form)return;e.preventDefault();this.handle(form)})},

  async handle(form){
    if(!AppConfig.web3FormsAccessKey)return alert('Web3Forms key missing');
    if(![...form.elements].every(el=>!el.required||el.value.trim()))return alert('Please fill all required fields');

    const btn=form.querySelector('button[type="submit"]');
    btn.disabled=true;btn.textContent='Sending...';

    try{
      const body=JSON.stringify({...Object.fromEntries(new FormData(form)),access_key:AppConfig.web3FormsAccessKey});
      const res=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json'},body});
      const data=await res.json();
      if(!data.success)throw 0;
      btn.textContent='Sent Successfully!';form.reset();
    }catch{btn.textContent='Error! Try Again'}
    finally{setTimeout(()=>{btn.disabled=false;btn.textContent='Submit'},3500)}
  }
};

/* ================= MODAL ================= */
const Modal={init(){const modal=Utils.$('#consultation-modal');if(!modal)return;const open=()=>{modal.hidden=false;document.body.style.overflow='hidden'};const close=()=>{modal.hidden=true;document.body.style.overflow=''};document.addEventListener('click',e=>{if(e.target.closest('.consultation-btn'))open();if(e.target.id==='modal-close'||e.target===modal)close()});document.addEventListener('keydown',e=>e.key==='Escape'&&close())}};

/* ================= CARD FLIP ================= */
const CardFlipper={init(){document.addEventListener('click',e=>e.target.closest('.js-flip-button')?.closest('.team-card')?.classList.toggle('is-flipped'))}};

/* ================= SCROLL ANIM ================= */
const ScrollAnimations={init(){const els=[...Utils.$$('.premium-card,.timeline-item,.highlight-item,.case-card')];if(!els.length)return;const obs=Utils.createObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.animation='fadeInUp .7s ease-out both';obs.unobserve(e.target)}})});els.forEach(el=>obs.observe(el))}};

/* ================= APP ================= */
const App={modules:[LoadingScreen,Navigation,ThemeToggle,StatsCounter,SwiperCarousels,CasesModule,Modal,FormHandler,CardFlipper,ScrollAnimations],init(){this.modules.forEach(m=>m.init?.())}};

window.addEventListener('DOMContentLoaded',()=>App.init(),{once:true});})();