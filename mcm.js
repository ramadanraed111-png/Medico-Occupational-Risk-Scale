/* Multi-condition MCM editor. Level 4 triggers clinical review only, not an automatic fitness decision. */
(()=> {
 const $=id=>document.getElementById(id), lib=window.POFRI_MEDICAL_LIBRARY||[], items=[];
 const category=$("mcm-category"), disease=$("mcm-disease"), level=$("mcm-level"), note=$("mcm-note"), body=$("mcm-items");
 if(!category||!disease||!level||!body)return;
 const warning=document.createElement("div");warning.id="mcm-level4-warning";warning.className="mcm-warning";warning.hidden=true;
 warning.setAttribute("role","alert");warning.innerHTML="<strong>تنبيه: توجد حالة طبية بمستوى 4</strong><p>يستلزم ذلك مراجعة طبية متخصصة وتقييم الحالة والوظيفة ومخاطر المهمة وموقع العمل. هذا التنبيه لا يصدر قرار لياقة ولا يعني عدم اللياقة تلقائياً.</p>";
 const anchor=$("mcm-add");anchor.parentNode.insertBefore(warning,anchor);
 const fill=(el,values,placeholder)=>{el.innerHTML="";const p=document.createElement("option");p.value="";p.textContent=placeholder;el.append(p);values.forEach(v=>{const o=document.createElement("option");o.value=v.value;o.textContent=v.label;el.append(o);});};
 lib.forEach(c=>{const o=document.createElement("option");o.value=c.category;o.textContent=c.label;category.append(o);});
 function current(){return lib.find(c=>c.category===category.value);}
 function chosenDisease(){return current()?.diseases?.find(x=>x.name===disease.value);}
 function preview(){const d=chosenDisease();const urgent=Number(level.value)===4;warning.hidden=!urgent;if(urgent)warning.querySelector("p").textContent="المؤشر المختار: "+d.name+" — "+d.levels[3]+". يلزم مراجعة طبية متخصصة وتقييم الحالة والوظيفة ومخاطر المهمة وموقع العمل. لا يصدر هذا التنبيه قرار لياقة ولا يعني عدم اللياقة تلقائياً.";}
 category.addEventListener("change",()=>{const c=current();fill(disease,(c?.diseases||[]).map(x=>({value:x.name,label:x.name})),"اختر المرض");disease.disabled=!c;level.disabled=true;level.innerHTML='<option value="">اختر مستوى الحالة</option>';warning.hidden=true;});
 disease.addEventListener("change",()=>{const d=chosenDisease();fill(level,(d?.levels||[]).map((x,i)=>({value:String(i+1),label:"المستوى "+(i+1)+" — "+x})),"اختر مستوى الحالة");level.disabled=!d;preview();});
 level.addEventListener("change",preview);
 function render(){body.innerHTML="";if(!items.length){body.innerHTML='<tr><td colspan="6">لم تتم إضافة حالات طبية بعد.</td></tr>';}else items.forEach((x,i)=>{const tr=document.createElement("tr");[x.category_label,x.disease,"المستوى "+x.level,x.description,x.notes||"—"].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});const td=document.createElement("td");if(x.level===4){const b=document.createElement("span");b.className="mcm-row-alert";b.textContent="مراجعة طبية";td.append(b);}const del=document.createElement("button");del.type="button";del.className="secondary";del.textContent="حذف";del.addEventListener("click",()=>{items.splice(i,1);render();});td.append(del);tr.append(td);body.append(tr);});
 const high=items.filter(x=>x.level===4);warning.hidden=high.length===0;
 if(high.length)warning.querySelector("p").textContent="تم تسجيل "+high.length+" حالة/حالات بمستوى 4: "+high.map(x=>x.disease).join("، ")+". يلزم مراجعة طبية متخصصة وتقييم الحالة والوظيفة ومخاطر المهمة وموقع العمل. لا يصدر هذا التنبيه قرار لياقة ولا يعني عدم اللياقة تلقائياً.";
 }
 $("mcm-add").addEventListener("click",()=>{const c=current(),d=chosenDisease();if(!c||!d||!level.value){alert("يرجى اختيار فئة المرض والمرض ومستوى الحالة.");return;}if(items.some(x=>x.category===c.category&&x.disease===d.name)){alert("تمت إضافة هذا المرض بالفعل. يمكنك حذف السطر السابق ثم إعادة إدخاله بمستوى مختلف.");return;}items.push({category:c.category,category_label:c.label,disease:d.name,level:Number(level.value),description:d.levels[Number(level.value)-1],notes:note.value.trim(),medical_review_required:Number(level.value)===4});note.value="";level.value="";warning.hidden=true;render();});
 window.POFRI_MCM={getItems:()=>items.map(x=>({...x})),hasLevel4:()=>items.some(x=>x.level===4),clear:()=>{items.splice(0,items.length);render();}};
 render();
})();