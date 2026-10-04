const app=document.getElementById('app');
const grades=window.GRADE_DATA||{};

let state={grade:null,index:0,score:0,locked:false,mistakes:[]};
function gradeName(g){return({5:'الخامس',6:'السادس',7:'السابع',8:'الثامن',9:'التاسع'})[g]}
function gradeFromPath(){const m=location.pathname.match(/\/g([5-9])\/?$/);if(m)return Number(m[1]);const q=new URLSearchParams(location.search).get('grade');return q?Number(q):null}
function baseUrl(){const p=location.pathname;const m=p.match(/^(.*\/)g[5-9]\/?$/);if(m)return location.origin+m[1];if(p.endsWith('/'))return location.origin+p;return location.origin+p.replace(/[^/]*$/,'')}
function gameUrl(g){return `${baseUrl()}g${g}/`}
function mainUrl(){return baseUrl()}
function route(){const g=gradeFromPath();if(g&&grades[g])renderLanding(g);else renderHome()}
function renderHome(){state={grade:null,index:0,score:0,locked:false,mistakes:[]};app.innerHTML=`
<section class="hero"><h2>نتعلّم العلوم… باللعب والتحدّي</h2><p>مكتبة رقمية علاجية لطلبة الصفوف الخامس حتى التاسع. صُممت الألعاب لمعالجة نقاط ضعف محددة في أساسيات العلوم والمهارات الرياضية الداعمة لها، مع تغذية راجعة فورية وتوصية علاجية.</p><div class="hero-actions"><a class="btn primary" href="#grades">اختر الصف</a><button class="btn secondary" onclick="copyText(mainUrl(),'تم نسخ رابط المكتبة')">نسخ رابط المكتبة</button></div></section>
<div class="section-title" id="grades"><h3>اختر الصف</h3><p>لكل صف لعبة مستقلة برابط مباشر يمكن مشاركته أو تحويله إلى QR.</p></div>
<section class="grade-grid">${Object.entries(grades).map(([g,x])=>`<a class="grade-card" href="${baseUrl()}g${g}/"><div class="grade-icon">${x.icon}</div><h4>الصف ${gradeName(g)}</h4><p>${x.title}<br>${x.theme}</p><div class="mini">فتح اللعبة ←</div></a>`).join('')}</section>
<section class="info-grid"><div class="info-card"><b>🎯 تعلم علاجي</b><span>كل لعبة مرتبطة بضعف شائع ومهارات واضحة.</span></div><div class="info-card"><b>🧩 ثلاث مستويات</b><span>تأسيس ثم تطبيق ثم تحدٍ.</span></div><div class="info-card"><b>📊 تشخيص فوري</b><span>نتيجة ختامية وتوصية حسب الأخطاء.</span></div></section>`}

function renderLanding(g){state={grade:g,index:0,score:0,locked:false,mistakes:[]};const G=grades[g];app.innerHTML=`<section class="game-shell">
<div class="game-head"><div><span class="badge">${G.icon} الصف ${gradeName(g)}</span><h2>${G.title}</h2><p>${G.theme}</p></div><a class="ghost-btn" href="${mainUrl()}">كل الصفوف</a></div>
<section class="overview-grid">
<div class="overview-card"><h3>🎯 الهدف من اللعبة</h3><p>${G.goal}</p></div>
<div class="overview-card"><h3>🩺 الضعف الذي تعالجه</h3><p>${G.weakness}</p></div>
<div class="overview-card"><h3>🧠 المهارات المستهدفة</h3><ul>${G.skills.map(s=>`<li>${s}</li>`).join('')}</ul></div>
<div class="overview-card"><h3>🎮 طريقة اللعب</h3><p>${G.method}</p></div>
<div class="overview-card teacher-note"><h3>👩‍🏫 تعليمات المعلم/ة</h3><p>${G.teacher}</p></div>
<div class="overview-card student-note"><h3>👧 تعليمات الطالب/ة</h3><p>${G.student}</p></div>
</section>
<section class="level-card"><div class="level-head"><div><h3 style="margin:0">مستويات التحدي</h3><p style="margin:3px 0 0;color:#607780">المستوى 1 تأسيس • المستوى 2 تطبيق • المستوى 3 تحدٍ</p></div><span class="level-pill">8 أسئلة علاجية</span></div></section>
<section class="start-panel"><h3>جاهز/ة للبدء؟</h3><p>المدة المقترحة: 8–12 دقيقة. اقرأ/ي التفسير بعد كل إجابة، فالهدف هو التعلم وليس جمع النقاط فقط.</p><button class="btn primary" onclick="startGame(${g})">ابدأ اللعبة الآن</button></section>
${shareBlock(g)}</section>`;window.scrollTo({top:0,behavior:'smooth'})}

function startGame(g){state={grade:g,index:0,score:0,locked:false,mistakes:[]};renderQuestion();window.scrollTo({top:0,behavior:'smooth'})}
function renderQuestion(){const G=grades[state.grade],q=G.questions[state.index],progress=state.index/G.questions.length*100;app.innerHTML=`<section class="game-shell">
<div class="game-head"><div><span class="badge">${G.icon} الصف ${gradeName(state.grade)}</span><h2>${G.title}</h2><p>المستوى ${q.l}: ${q.l===1?'تأسيس':q.l===2?'تطبيق':'تحدٍ'} • المهارة: ${q.tag}</p></div><button class="ghost-btn" onclick="renderLanding(${state.grade})">حول اللعبة</button></div>
<div class="progress-wrap"><div class="progress-line"><div style="width:${progress}%"></div></div><div class="progress-meta"><span>السؤال ${state.index+1} من ${G.questions.length}</span><span>النقاط: ${state.score}</span></div></div>
<div class="challenge"><h3>${q.q}</h3><div class="answers">${q.a.map((a,i)=>`<button class="answer" onclick="choose(${i},this)">${a}</button>`).join('')}</div><div id="feedback" class="feedback"></div><div class="next-row"><span class="score-chip">اقرأ/ي التفسير قبل الانتقال</span><button id="nextBtn" class="btn primary" style="display:none" onclick="nextQuestion()">التالي</button></div></div></section>`}
function choose(i,btn){if(state.locked)return;state.locked=true;const G=grades[state.grade],q=G.questions[state.index],buttons=[...document.querySelectorAll('.answer')];buttons.forEach((b,idx)=>{if(idx===q.c)b.classList.add('correct')});const fb=document.getElementById('feedback');if(i===q.c){state.score++;fb.className='feedback show ok';fb.innerHTML=`✅ إجابة صحيحة. ${q.w}`}else{btn.classList.add('wrong');state.mistakes.push(q.tag);fb.className='feedback show bad';fb.innerHTML=`❌ الإجابة تحتاج مراجعة. ${q.w}`}document.getElementById('nextBtn').style.display='inline-flex'}
function nextQuestion(){state.index++;state.locked=false;if(state.index>=grades[state.grade].questions.length)renderResult();else renderQuestion()}
function renderResult(){const G=grades[state.grade],total=G.questions.length,pct=Math.round(state.score/total*100);let icon='🧠',msg='تحتاج/ين إلى مراجعة الأساسيات وإعادة المحاولة.';if(pct>=88){icon='🏆';msg='إتقان قوي للأساسيات المستهدفة.'}else if(pct>=63){icon='🌟';msg='أداء جيد، مع حاجة لمراجعة نقاط محددة.'}const counts={};state.mistakes.forEach(x=>counts[x]=(counts[x]||0)+1);const weak=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);const diag=weak.length?`ركّز/ي في المراجعة القادمة على: <b>${weak.join('، ')}</b>.`:'لم تظهر نقطة ضعف واضحة في هذه المحاولة.';app.innerHTML=`<section class="game-shell"><div class="result"><div class="big">${icon}</div><h3>أنهيت ${G.title}</h3><p>حصلت على <b>${state.score} من ${total}</b> (${pct}%).<br>${msg}</p><div class="diagnostic"><b>التوصية العلاجية:</b><br>${diag}${pct<63?'<br>أعد اللعبة بعد مراجعة قصيرة، والهدف الوصول إلى 63% على الأقل.':''}</div><div class="result-actions" style="justify-content:center;margin-top:18px"><button class="btn primary" onclick="startGame(${state.grade})">إعادة المحاولة</button><button class="ghost-btn" onclick="renderLanding(${state.grade})">حول اللعبة</button><a class="ghost-btn" href="${mainUrl()}">صف آخر</a></div></div>${shareBlock(state.grade)}</section>`}
function shareBlock(g){return `<div class="share-box"><h4>مشاركة اللعبة</h4><p>رابط مباشر للصف ${gradeName(g)} ورمز QR الخاص به.</p><div class="qr-placeholder"><img src="${baseUrl()}qr-grade-${g}.svg" alt="QR الصف ${g}"><button class="ghost-btn" onclick="copyText(gameUrl(${g}),'تم نسخ رابط اللعبة')">نسخ الرابط المباشر</button><span class="footer-note">${gameUrl(g)}</span></div></div>`}
function copyText(text,msg){navigator.clipboard?.writeText(text);toast(msg)}
function toast(t){const x=document.createElement('div');x.textContent=t;Object.assign(x.style,{position:'fixed',bottom:'22px',left:'50%',transform:'translateX(-50%)',background:'#173042',color:'white',padding:'10px 16px',borderRadius:'12px',zIndex:1000});document.body.appendChild(x);setTimeout(()=>x.remove(),1700)}
route();