/* Multi-condition MCM editor. Each condition is recorded independently. */
(()=> {
 const $=id=>document.getElementById(id), lib=window.POFRI_MEDICAL_LIBRARY||[], items=[];
 const category=$("mcm-category"), disease=$("mcm-disease"), level=$("mcm-level"), note=$("mcm-note"), body=$("mcm-items");
 const fill=(el,values,placeholder)=>{el.innerHTML="";const p=document.createElement("option");p.value="";p.textContent=placeholder;el.append(p);values.forEach(v=>{const o=document.createElement("option");o.value=v.value;o.textContent=v.label;el.append(o);});};
 lib.forEach(c=>{const o=document.createElement("option");o.value=c.category;o.textContent=c.label;category.append(o);});
 function current(){return lib.find(c=>c.category===category.value);}
 category.addEventListener("change",()=>{const c=current();fill(disease,(c?.diseases||[]).map(x=>({value:x,label:x})),"اختر المرض");disease.disabled=!c;level.disabled=true;level.innerHTML='<option value="">اختر مستوى الحالة</option>';});
 disease.addEventListener("change",()=>{const c=current();fill(level,(c?.levels||[]).map((x,i)=>({value:String(i+1),label:"المستوى "+(i+1)+" — "+x})),"اختر مستوى الحالة");level.disabled=!disease.value;});
 function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 function render(){body.innerHTML="";if(!items.length){body.innerHTML='<tr><td colspan="5">لم تتم إضافة حالات طبية بعد.</td></tr>';return;}
 items.forEach((x,i)=>{const tr=document.createElement("tr");[x.category_label,x.disease,"المستوى "+x.level,x.description,x.notes||"—"].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});const td=document.createElement("td"),b=document.createElement("button");b.type="button";b.className="secondary";b.textContent="حذف";b.addEventListener("click",()=>{items.splice(i,1);render();});td.append(b);tr.append(td);body.append(tr);});}
 $("mcm-add").addEventListener("click",()=>{const c=current();if(!c||!disease.value||!level.value){alert("يرجى اختيار فئة المرض والمرض ومستوى الحالة.");return;}if(items.some(x=>x.category===c.category&&x.disease===disease.value)){alert("تمت إضافة هذا المرض بالفعل. يمكنك حذف السطر السابق ثم إعادة إدخاله بمستوى مختلف.");return;}items.push({category:c.category,category_label:c.label,disease:disease.value,level:Number(level.value),description:c.levels[Number(level.value)-1],notes:note.value.trim()});note.value="";render();});
 window.POFRI_MCM={getItems:()=>items.map(x=>({...x})),clear:()=>{items.splice(0,items.length);render();}};
 render();
})();
