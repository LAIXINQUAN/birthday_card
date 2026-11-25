(function(){
  'use strict';

  var CONFETTI_CHARS=['🎉','🎊','🎈','⭐','🎂','💖'];
  var BALLOON_COLORS=['#ff8fa8','#8fd3ff','#ffe08f','#b28dff','#8fe8c0','#ff9a76'];
  var NOTE_FREQ={G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
  var MELODY=[
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2],
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2],
    ['G4',.75],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2],
    ['F5',.75],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',2.5]
  ];
  var BEAT=.42;
  var METEOR_MAX=6;      /* 同屏流星上限 */
  var SPARK_MAX=18;      /* 同屏烛光粒子上限 */

  function later(fn,ms){return setTimeout(fn,ms);}

  /* ===== URL 名字：支持 ?name=xxx 与 #xxx 两种写法 ===== */
  function applyNameParam(){
    var name=null;
    try{
      name=new URLSearchParams(window.location.search).get('name');
      if(!name && window.location.hash.length>1){
        name=decodeURIComponent(window.location.hash.slice(1));
      }
    }catch(e){name=null;}
    if(!name)return;
    var h2=document.querySelector('.content h2');
    if(h2)h2.textContent='Hi，'+name+'，';
  }
  applyNameParam();

  /* ===== Canvas特效：顶部流星 + 烛光粒子 ===== */
  var canvas=document.getElementById('fx');
  var ctx=canvas.getContext('2d');
  var meteors=[];
  var sparks=[];
  var candlesLit=false;  /* 点击开始后点燃 */

  function fitCanvas(){
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
  }
  window.addEventListener('resize',fitCanvas);
  fitCanvas();

  function spawnMeteor(){
    meteors.push({
      x:Math.random()*canvas.width*.8+canvas.width*.1,
      y:-10,
      vx:-(1.2+Math.random()*1.4),
      vy:2.2+Math.random()*1.6,
      len:40+Math.random()*50,
      hue:Math.random()*60+20,
      life:1
    });
  }
  function spawnSpark(){
    sparks.push({
      x:canvas.width/2+(Math.random()*120-60),
      y:canvas.height*.35+Math.random()*40,
      vx:Math.random()*.4-.2,
      vy:-(.4+Math.random()*.5),
      r:1+Math.random()*1.8,
      life:1
    });
  }

  function step(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(Math.random()<.06 && meteors.length<METEOR_MAX)spawnMeteor();
    meteors.forEach(function(m){
      var grad=ctx.createLinearGradient(m.x,m.y,m.x+m.len,m.y-m.len);
      grad.addColorStop(0,'hsla('+m.hue+',95%,70%,.9)');
      grad.addColorStop(1,'hsla('+m.hue+',95%,70%,0)');
      ctx.strokeStyle=grad;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(m.x,m.y);
      ctx.lineTo(m.x+m.len,m.y-m.len);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(m.x,m.y,2,0,Math.PI*2);
      ctx.fillStyle='rgba(255,250,220,'+m.life+')';
      ctx.fill();
      m.x+=m.vx;m.y+=m.vy;m.life-=.008;
    });
    meteors=meteors.filter(function(m){return m.life>0&&m.y<canvas.height+60;});

    if(candlesLit && sparks.length<SPARK_MAX && Math.random()<.5)spawnSpark();
    sparks.forEach(function(s){
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,200,90,'+(s.life*.8)+')';
      ctx.fill();
      s.x+=s.vx;s.y+=s.vy;s.life-=.012;s.r*=.995;
    });
    sparks=sparks.filter(function(s){return s.life>0;});

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  /* ===== 逐字点亮祝福语 ===== */
  function lightUpText(){
    var p=document.getElementById('wishText');
    var text=p.textContent;
    p.textContent='';
    Array.prototype.forEach.call(text,function(ch,i){
      var b=document.createElement('b');
      b.textContent=ch;
      b.style.animationDelay=(i*.05)+'s';
      p.appendChild(b);
    });
  }
  later(lightUpText,600);

  /* ===== 彩带雨 ===== */
  function rainConfetti(){
    for(var i=0;i<60;i++){
      var piece=document.createElement('div');
      piece.className='confetti';
      piece.textContent=CONFETTI_CHARS[Math.floor(Math.random()*CONFETTI_CHARS.length)];
      piece.style.left=Math.random()*100+'vw';
      piece.style.fontSize=(14+Math.random()*18)+'px';
      piece.style.animationDuration=(2.5+Math.random()*2.5)+'s';
      piece.style.animationDelay=(Math.random()*1.5)+'s';
      document.body.appendChild(piece);
      later(function(node){return function(){node.remove();};}(piece),8000);
    }
  }

  /* ===== 气球放飞 ===== */
  function releaseBalloons(count){
    for(var i=0;i<count;i++){
      later(function(idx){
        return function(){
          var b=document.createElement('div');
          b.className='balloon';
          var color=BALLOON_COLORS[idx%BALLOON_COLORS.length];
          var skin=document.createElement('span');
          skin.className='skin';
          skin.style.background='radial-gradient(circle at 32% 28%,rgba(255,255,255,.85) 8%,'+color+' 42%)';
          skin.style.boxShadow='inset -4px -6px 10px rgba(0,0,0,.12)';
          var str=document.createElement('span');
          str.className='string';
          str.style.background=color;
          b.appendChild(skin);
          b.appendChild(str);
          b.style.left=(4+Math.random()*92)+'vw';
          b.style.animationDuration=(7+Math.random()*5)+'s';
          document.body.appendChild(b);
          later(function(node){return function(){node.remove();};}(b),13000);
        };
      }(i), i*260);
    }
  }

  /* ===== 许愿弹层 ===== */
  function showWishOverlay(){
    var overlay=document.createElement('div');
    overlay.className='wish-overlay';
    var p=document.createElement('p');
    p.textContent='🎂 生日快乐！';
    overlay.appendChild(p);
    document.body.appendChild(overlay);
    later(function(){overlay.remove();},3800);
  }

  /* ===== 生日歌（钢琴音色 + 空五度低音伴奏 + 轻混响） ===== */
  function pianoNote(ctx,bus,freq,t,dur,vol){
    /* 钢琴质感：基频 + 衰减的泛音列 + 击弦瞬态后指数衰减 */
    var partials=[[1,1],[2,.38],[3,.16],[4,.07]];
    partials.forEach(function(p){
      var osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type='sine';
      osc.frequency.value=freq*p[0];
      var v=vol*p[1];
      gain.gain.setValueAtTime(0,t);
      gain.gain.linearRampToValueAtTime(v,t+.006);
      gain.gain.exponentialRampToValueAtTime(v*.3,t+Math.min(dur*.55,.4));
      gain.gain.exponentialRampToValueAtTime(.0006,t+dur);
      osc.connect(gain);gain.connect(bus);
      osc.start(t);osc.stop(t+dur+.03);
    });
  }
  function playMelody(ctx){
    var t=ctx.currentTime+.1;
    /* 总线：干声直达 + 延迟反馈做轻混响 */
    var dry=ctx.createGain();dry.connect(ctx.destination);
    var delay=ctx.createDelay();delay.delayTime.value=.27;
    var fb=ctx.createGain();fb.gain.value=.24;
    var wet=ctx.createGain();wet.gain.value=.16;
    delay.connect(fb);fb.connect(delay);delay.connect(wet);wet.connect(ctx.destination);
    var bus=ctx.createGain();
    bus.connect(dry);bus.connect(delay);

    MELODY.forEach(function(step){
      var dur=step[1]*BEAT;
      pianoNote(ctx,bus,NOTE_FREQ[step[0]],t,dur+.08,.22);
      /* 高八度弱声部保留一点合唱感 */
      pianoNote(ctx,bus,NOTE_FREQ[step[0]]*2,t,dur,.045);
      t+=dur;
    });

    /* 低音伴奏：3/4 拍一小节，空五度和声（无三音，不与旋律打架） */
    var MEASURE=BEAT*3;
    var C3=130.81,G2=98,D3=146.83,F2=87.31,G3=196,C4=261.63;
    var ACC=[ /* 每小节 [根音, 五音] */
      [C4,G3],[C3,G3],[G2,D3],[G2,D3],[C3,G3],[C3,G3],
      [G2,D3],[G2,D3],[C3,G3],[F2,C3],[C3,G3],[C3,G3]
    ];
    ACC.forEach(function(pair,i){
      var ta=ctx.currentTime+.1+i*MEASURE;
      pianoNote(ctx,bus,pair[0],ta,MEASURE*.96,.085);
      pianoNote(ctx,bus,pair[1],ta,MEASURE*.96,.055);
    });

    var totalBeats=MELODY.reduce(function(s,step){return s+step[1];},0);
    var totalSec=Math.max(totalBeats*BEAT,ACC.length*MEASURE);
    return totalSec*1000+900;
  }

  /* ===== 鼠标/触摸星尘拖尾 ===== */
  var trailThrottle=0;
  function spawnTrail(x,y){
    var dot=document.createElement('div');
    dot.className='trail-dot';
    dot.style.left=(x-3)+'px';
    dot.style.top=(y-3)+'px';
    var hue=Math.random()*40+15;
    dot.style.background='radial-gradient(circle,hsla('+hue+',95%,70%,.95),hsla('+hue+',95%,70%,0))';
    document.body.appendChild(dot);
    later(function(node){return function(){node.remove();};}(dot),700);
  }
  window.addEventListener('pointermove',function(e){
    var now=Date.now();
    if(now-trailThrottle<40)return;
    trailThrottle=now;
    spawnTrail(e.clientX,e.clientY);
  });

  /* ===== 开花动画：从指定位置绽放 ===== */
  function bloomAt(x,y){
    var b=document.createElement('div');
    b.className='bloom';
    b.style.left=(x-30)+'px';
    b.style.top=(y-30)+'px';
    var ring=document.createElement('div');
    ring.className='petal-ring';
    for(var i=0;i<6;i++){
      var petal=document.createElement('span');
      petal.className='petal';
      petal.style.transform='rotate('+(i*60)+'deg) translateY(-22px)';
      ring.appendChild(petal);
    }
    b.appendChild(ring);
    document.body.appendChild(b);
    later(function(node){return function(){node.remove();};}(b),2500);
  }

  /* ===== 孔明灯 ===== */
  function releaseLantern(wishText){
    var l=document.createElement('div');
    l.className='lantern';
    var body=document.createElement('span');
    body.className='body';
    if(wishText)body.title=wishText;
    var cap=document.createElement('span');
    cap.className='cap';
    l.appendChild(body);l.appendChild(cap);
    l.style.left=(10+Math.random()*80)+'vw';
    l.style.animationDuration=(11+Math.random()*5)+'s';
    document.body.appendChild(l);
    later(function(node){return function(){node.remove();};}(l),17000);
  }
  function releaseLanterns(count){
    for(var i=0;i<count;i++){
      later(function(){releaseLantern();},i*400);
    }
  }

  /* ===== 许愿输入弹窗 ===== */
  function askWish(){
    var dlg=document.createElement('div');
    dlg.className='wish-dialog';
    var panel=document.createElement('div');
    panel.className='panel';
    var h3=document.createElement('h3');
    h3.textContent='🎂 许个愿吧';
    var tip=document.createElement('p');
    tip.className='tip';
    tip.textContent='写下你的愿望，它会随孔明灯升上夜空（仅保存在本页面，不会上传）';
    var input=document.createElement('input');
    input.type='text';
    input.maxLength=30;
    input.placeholder='我的愿望是…';
    var actions=document.createElement('div');
    actions.className='actions';
    var ok=document.createElement('button');
    ok.className='ok';
    ok.type='button';
    ok.textContent='放飞愿望';
    var skip=document.createElement('button');
    skip.className='skip';
    skip.type='button';
    skip.textContent='跳过';
    actions.appendChild(ok);
    actions.appendChild(skip);
    panel.appendChild(h3);
    panel.appendChild(tip);
    panel.appendChild(input);
    panel.appendChild(actions);
    dlg.appendChild(panel);
    document.body.appendChild(dlg);
    input.focus();

    function close(){dlg.remove();}
    function confirmWish(){
      var text=input.value.trim();
      close();
      releaseLantern(text||'祝你生日快乐');
      releaseLanterns(7);
      var r=panel.getBoundingClientRect();
      bloomAt(window.innerWidth/2,window.innerHeight/2);
    }
    ok.addEventListener('click',confirmWish);
    skip.addEventListener('click',close);
    input.addEventListener('keydown',function(e){
      if(e.key==='Enter')confirmWish();
      if(e.key==='Escape')close();
    });
  }

  /* ===== 吹蜡烛 ===== */
  var cake=document.getElementById('c3candles');
  var blownCount=0;
  cake.addEventListener('click',function(e){
    var wrap=e.target.closest('.c3-wrap');
    if(!wrap||wrap.dataset.lit!=='1')return;
    wrap.dataset.lit='0';
    wrap.classList.add('c3-out');
    var smoke=document.createElement('span');
    smoke.className='smoke';
    wrap.appendChild(smoke);
    later(function(node){return function(){node.remove();};}(smoke),1700);
    blownCount++;
    if(blownCount===3){
      later(function(){
        bloomAt(window.innerWidth/2,window.innerHeight/2);
        releaseLanterns(9);
        showFinaleOverlay();
      },500);
    }
  });
  function showFinaleOverlay(){
    var overlay=document.createElement('div');
    overlay.className='wish-overlay';
    var p=document.createElement('p');
    p.textContent='🕯 愿望成真！';
    overlay.appendChild(p);
    document.body.appendChild(overlay);
    later(function(){overlay.remove();},3800);
  }

  /* ===== 启动 ===== */
  var btn=document.getElementById('playBtn');
  var playing=false;
  var TEXT_PLAYING='播放中…';
  var TEXT_REPLAY='再听一遍';

  btn.addEventListener('click',function(){
    if(playing)return;
    playing=true;
    btn.textContent=TEXT_PLAYING;
    candlesLit=true;

    var audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    var totalMs=playMelody(audioCtx);

    rainConfetti();
    releaseBalloons(10);
    showWishOverlay();
    later(askWish,2000);

    later(function(){
      playing=false;
      btn.textContent=TEXT_REPLAY;
      audioCtx.close();
      candlesLit=false;
    },totalMs);
  });
})();
