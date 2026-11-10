/* Dynamic JEM controls: preserves each hazard, severity and frequency independently. */
(()=> {
 const library=window.POFRI_JEM_LIBRARY||[];
 const $=id=>document.getElementById(id);
 const items=[];
 const freqLabels={rare:"نادر",occasional:"ظرفي",repeated:"متكرر",continuous:"مستمر"};
 const severityLabels=["منخفض","متوسط","مرتفع","شديد"];
 const categories=[...new Set(library.map(x=>x.category))];
 const category=$("jem-category"),hazard=$("jem-hazard"),severity=$("jem-severity"),frequency=$("jem-frequency");
 const custom=$("jem-custom-fields"),basis=$("jem-basis"),tbody=$("jem-items");
 const fill=(el,opts,first)=>{el.innerHTML="";const p=document.createElement("option");p.value="";p.textContent=first;el.append(p);opts.forEach(o=>{const x=document.createElement("option");x.value=o.value;x.textContent=o.label;el.append(x);});};
 categories.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;category.append(o);});
 function selected(){return library.find(x=>x.name===hazard.value&&x.category===category.value);}
 function resetSeverity(){severity.disabled=true;severity.innerHTML='<option value="">اختر الشدة</option>';basis.textContent="";}
 category.addEventListener("change",()=>{
   const options=library.filter(x=>x.category===category.value).map(x=>({value:x.name,label:x.name}));
   fill(hazard,options,"اختر الخطر");const customOpt=document.createElement("option");customOpt.value="__custom__";customOpt.textContent="خطر آخر / مخصص";hazard.append(customOpt);
   hazard.disabled=!category.value;resetSeverity();frequency.value="";custom.hidden=true;
 });
 hazard.addEventListener("change",()=>{
   const h=selected();custom.hidden=hazard.value!=="__custom__";severity.disabled=false;severity.innerHTML='<option value="">اختر الشدة</option>';
   if(h){h.levels.forEach((desc,i)=>{const o=document.createElement("option");o.value=String(i+1);const lab=i===3?(h.criticalLabel||"شديد"):severityLabels[i];o.textContent=lab+" — "+desc;severity.append(o);});basis.textContent=h.basis?"أساس تقييم الشدة: "+h.basis:"";} 
   else if(hazard.value==="__custom__"){severity.innerHTML="";const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="اختر الشدة";severity.append(placeholder);severityLabels.forEach((lab,i)=>{const o=document.createElement("option");o.value=String(i+1);o.textContent=lab;severity.append(o);});basis.textContent="أدخل وصف الخطر وبيانات القياس أو ظروف التعرض وفق تقييم الموقع.";}
   else resetSeverity();
 });
 function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 function syncLegacy(){
   const map={chem:"none",noise:"none",heat:"none",bio:"none","physical-hazard":"none"};
   const max={chem:0,noise:0,heat:0,bio:0,"physical-hazard":0};
   for(const x of items){
     const c=x.category;
     let key=c==="مخاطر كيميائية"?"chem":c==="المخاطر البيولوجية"?"bio":c==="المخاطر النفسية والتنظيمية"||c==="المخاطر البيئية والمناخية"?"heat":c==="مخاطر الإشعاع"?"physical-hazard":c==="مخاطر فيزيائية"?"noise":"physical-hazard";
     max[key]=Math.max(max[key],Number(x.severity)||0);
   }
   Object.keys(map).forEach(k=>{map[k]=max[k]===0?"none":max[k]===1?"low":max[k]===2?"moderate":"high";$(k).value=map[k];});
   const rank={rare:0,occasional:1,repeated:2,continuous:3};const top=items.reduce((m,x)=>Math.max(m,rank[x.frequency]??0),0);
   $("frequency").value=top>=2?"frequent":top===1?"occasional":"occasional";
 }
 function render(){
   tbody.innerHTML="";
   if(!items.length){tbody.innerHTML='<tr><td colspan="6">لم تتم إضافة أخطار بعد.</td></tr>';syncLegacy();return;}
   items.forEach((x,i)=>{
     const tr=document.createElement("tr");
     const cells=[x.category,x.name,x.severity_label+" — "+x.severity_description,freqLabels[x.frequency],x.notes||"—"];
     cells.forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});
     const td=document.createElement("td"),b=document.createElement("button");b.type="button";b.className="secondary";b.textContent="حذف";b.addEventListener("click",()=>{items.splice(i,1);render();});td.append(b);tr.append(td);tbody.append(tr);
   });
   syncLegacy();
 }
 $("jem-add").addEventListener("click",()=>{
   if(!category.value||!hazard.value||!severity.value||!frequency.value){alert("يرجى اختيار فئة الخطر والخطر والشدة ومعدل التعرض.");return;}
   const h=selected(),isCustom=hazard.value==="__custom__";
   const customName=$("jem-custom-name").value.trim(),customDesc=$("jem-custom-description").value.trim();
   if(isCustom&&!customName){alert("يرجى كتابة اسم الخطر غير المدرج.");$("jem-custom-name").focus();return;}
   const index=Number(severity.value)-1;
   const desc=isCustom?customDesc:(h?.levels[index]||"");
   items.push({category:category.value,name:isCustom?customName:hazard.value,severity:severity.value,severity_label:isCustom?severityLabels[index]:(index===3?(h.criticalLabel||"شديد"):severityLabels[index]),severity_description:desc,frequency:frequency.value,basis:h?.basis||"",notes:$("jem-notes").value.trim(),custom:isCustom});
   $("jem-notes").value="";$("jem-custom-name").value="";$("jem-custom-description").value="";
   severity.value="";frequency.value="";render();
 });
 window.POFRI_JEM={getItems:()=>items.map(x=>({...x}))};
 render();
})();
