/* GlowRoutine — Smart Routine Matcher
   Category data + matching engine. Pure client-side, no server, no dependencies. */

var PLANNER_CATEGORIES = [
  { slug:"led-light-therapy-face-masks", title:"LED Light Therapy Face Masks", group:"Skincare Tech", tag:"skincare",
    concern:["skincare"], context:["home"], priority:["results","relaxation"], price:[120,280],
    img:"led-light-therapy-face-masks.jpg" },
  { slug:"facial-steamers-at-home-spa-tools", title:"Facial Steamers & At-Home Spa Tools", group:"Skincare Tech", tag:"skincare",
    concern:["skincare"], context:["home"], priority:["relaxation","results"], price:[40,120],
    img:"facial-steamers-at-home-spa-tools.jpg" },
  { slug:"microcurrent-radiofrequency-facial-devices", title:"Microcurrent & Radiofrequency Facial Devices", group:"Skincare Tech", tag:"skincare",
    concern:["skincare"], context:["home"], priority:["results"], price:[150,350],
    img:"microcurrent-radiofrequency-facial-devices.jpg" },
  { slug:"silk-pillowcases-hair-care-essentials", title:"Silk Pillowcases & Hair Care Essentials", group:"Hair Care", tag:"haircare",
    concern:["hair"], context:["home"], priority:["protection","convenience"], price:[20,60],
    img:"silk-pillowcases-hair-care-essentials.jpg" },
  { slug:"compact-hair-straighteners-travel-stylers", title:"Compact Hair Straighteners & Travel Stylers", group:"Hair Care", tag:"haircare",
    concern:["hair"], context:["home","travel"], priority:["convenience"], price:[30,80],
    img:"compact-hair-straighteners-travel-stylers.jpg" },
  { slug:"high-end-hair-styling-tools", title:"High-End Hair Styling Tools", group:"Hair Care", tag:"haircare",
    concern:["hair"], context:["home"], priority:["results","luxury"], price:[120,300],
    img:"high-end-hair-styling-tools.jpg" },
  { slug:"lighted-makeup-mirrors", title:"Lighted Makeup Mirrors", group:"Makeup & Vanity", tag:"makeup",
    concern:["makeup"], context:["home"], priority:["organization","convenience"], price:[40,110],
    img:"lighted-makeup-mirrors.jpg" },
  { slug:"makeup-jewelry-travel-organizers", title:"Makeup & Jewelry Travel Organizers", group:"Makeup & Vanity", tag:"makeup",
    concern:["makeup"], context:["home","travel"], priority:["organization","convenience"], price:[20,55],
    img:"makeup-jewelry-travel-organizers.jpg" },
  { slug:"fine-jewelry-care-display-boxes", title:"Fine Jewelry Care & Display Boxes", group:"Makeup & Vanity", tag:"makeup",
    concern:["makeup"], context:["home"], priority:["organization","luxury"], price:[30,90],
    img:"fine-jewelry-care-display-boxes.jpg" },
  { slug:"luxury-bath-aromatherapy-rituals", title:"Luxury Bath & Aromatherapy Rituals", group:"Bath & Wellness", tag:"bath",
    concern:["bath"], context:["home"], priority:["relaxation","luxury"], price:[25,70],
    img:"luxury-bath-aromatherapy-rituals.jpg" },
  { slug:"recovery-wellness-tech-for-women", title:"Recovery & Wellness Tech for Women", group:"Bath & Wellness", tag:"bath",
    concern:["bath"], context:["home"], priority:["relaxation","results"], price:[60,180],
    img:"recovery-wellness-tech-for-women.jpg" },
  { slug:"designer-perfume-organizers-atomizer-sets", title:"Designer Perfume Organizers & Atomizer Sets", group:"Bath & Wellness", tag:"bath",
    concern:["bath"], context:["home","travel"], priority:["organization","luxury"], price:[20,60],
    img:"designer-perfume-organizers-atomizer-sets.jpg" },
  { slug:"uv-led-gel-nail-lamps", title:"UV/LED Gel Nail Lamps & Curing Tools", group:"Nail Care", tag:"nails",
    concern:["nails"], context:["home"], priority:["results","convenience"], price:[15,60],
    img:"https://images.unsplash.com/photo-1763987300719-fd27c51a3227?w=600&q=80&auto=format&fit=crop" },
  { slug:"electric-nail-files-manicure-drill-kits", title:"Electric Nail Files & Manicure Drill Kits", group:"Nail Care", tag:"nails",
    concern:["nails"], context:["home","travel"], priority:["convenience","results"], price:[15,45],
    img:"https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=600&q=80&auto=format&fit=crop" },
  { slug:"press-on-nails-manicure-kits", title:"Press-On Nails & At-Home Manicure Kits", group:"Nail Care", tag:"nails",
    concern:["nails"], context:["home","travel"], priority:["convenience","organization"], price:[10,35],
    img:"https://images.unsplash.com/photo-1655370865452-269cef0b1b85?w=600&q=80&auto=format&fit=crop" }
];

var PLANNER_CONCERNS = [
  { key:"skincare", label:"Skin & anti-aging", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /> <path d="M20 2v4" /> <path d="M22 4h-4" /> <circle cx="4" cy="20" r="2" /> </svg>' },
  { key:"hair", label:"Hair styling & health", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <circle cx="6" cy="6" r="3" /> <path d="M8.12 8.12 12 12" /> <path d="M20 4 8.12 15.88" /> <circle cx="6" cy="18" r="3" /> <path d="M14.8 14.8 20 20" /> </svg>' },
  { key:"makeup", label:"Makeup & vanity", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /> <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /> <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /> <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /> <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /> </svg>' },
  { key:"bath", label:"Bath, relaxation & recovery", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 4 8 6" /> <path d="M17 19v2" /> <path d="M2 12h20" /> <path d="M7 19v2" /> <path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /> </svg>' },
  { key:"nails", label:"Nail care & manicures", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M9 2h6" /> <path d="M10 2v4.2a2 2 0 0 1-.4 1.2L7.1 10.9A4 4 0 0 0 6.3 13.3L6 20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l-.3-6.7a4 4 0 0 0-.8-2.4l-2.5-3.5a2 2 0 0 1-.4-1.2V2" /> </svg>' }
];

var PLANNER_PRIORITIES = [
  { key:"results", label:"Visible results over time", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M16 7h6v6" /> <path d="m22 7-8.5 8.5-5-5L2 17" /> </svg>' },
  { key:"protection", label:"Damage prevention", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> </svg>' },
  { key:"organization", label:"Organization & tidiness", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /> </svg>' },
  { key:"relaxation", label:"Relaxation / self-care", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" /> <circle cx="12" cy="8" r="2" /> <path d="M12 10v12" /> <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z" /> <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z" /> </svg>' },
  { key:"convenience", label:"Quick & low-effort", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" /> </svg>' },
  { key:"luxury", label:"Elevated / gift-worthy", icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M12 7v14" /> <path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" /> <path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" /> <rect x="3" y="7" rx="1" /> </svg>' }
];

var PLANNER_CONCERN_LABEL = {};
PLANNER_CONCERNS.forEach(function(r){ PLANNER_CONCERN_LABEL[r.key] = r.label; });
var PLANNER_PRIORITY_LABEL = {};
PLANNER_PRIORITIES.forEach(function(p){ PLANNER_PRIORITY_LABEL[p.key] = p.label; });

/* ---- Matching engine ---- */
function plannerBuildPlan(state){
  var concern = state.concern, travel = state.travel, priorities = state.priorities || [], budget = state.budget || 150;

  var pool = PLANNER_CATEGORIES.filter(function(c){ return !travel || c.context.indexOf("travel") !== -1; });

  pool = pool.map(function(c){
    var score = 0;
    var matchedConcern = false, matchedPriorities = [];
    if (c.concern.indexOf(concern) !== -1) { score += 3.5; matchedConcern = true; }
    priorities.forEach(function(p){
      if (c.priority.indexOf(p) !== -1) { score += 4; matchedPriorities.push(p); }
    });
    var perItemBudget = budget / Math.max(priorities.length, 1);
    var budgetFit = "ok";
    if (c.price[0] <= perItemBudget * 1.7) { score += 1.5; }
    else if (c.price[0] > budget) { score -= 3; budgetFit = "tight"; }
    return {
      cat:c, score:score, matchedConcern:matchedConcern, matchedPriorities:matchedPriorities, budgetFit:budgetFit
    };
  }).filter(function(x){ return x.score > 0; })
    .sort(function(a,b){ return b.score - a.score; });

  var picks = [], used = {};
  /* Always try to lead with the best pick from the chosen concern area */
  for (var i=0;i<pool.length;i++){
    if (pool[i].matchedConcern){ picks.push(pool[i]); used[pool[i].cat.slug] = true; break; }
  }
  priorities.forEach(function(p){
    for (var i=0;i<pool.length;i++){
      var x = pool[i];
      if (!used[x.cat.slug] && x.matchedPriorities.indexOf(p) !== -1){
        picks.push(x); used[x.cat.slug] = true; break;
      }
    }
  });
  for (var i=0;i<pool.length && picks.length < 5;i++){
    var x = pool[i];
    if (!used[x.cat.slug]){ picks.push(x); used[x.cat.slug] = true; }
  }
  picks = picks.slice(0,5);

  if (picks.length === 0){
    var fallback = PLANNER_CATEGORIES.filter(function(c){ return !travel || c.context.indexOf("travel") !== -1; }).slice(0,4);
    picks = fallback.map(function(c){ return {cat:c, score:0, matchedConcern:false, matchedPriorities:[], budgetFit:"ok", fallback:true}; });
  }

  var mids = picks.map(function(x){ return (x.cat.price[0]+x.cat.price[1])/2; });
  var total = mids.reduce(function(a,b){ return a+b; }, 0) || 1;
  picks.forEach(function(x, i){
    x.alloc = Math.round(budget * mids[i] / total);
  });

  return picks;
}

function plannerReasonChips(x, state){
  var chips = [];
  if (x.fallback){ chips.push("Popular pick for your routine"); return chips; }
  if (x.matchedConcern) chips.push("Matches: " + (PLANNER_CONCERN_LABEL[state.concern] || "your focus"));
  if (state.travel && x.cat.context.indexOf("travel") !== -1) chips.push("Travel-friendly");
  x.matchedPriorities.forEach(function(p){ chips.push("Matches: " + PLANNER_PRIORITY_LABEL[p]); });
  if (x.budgetFit === "ok" && chips.length < 3) chips.push("Fits your budget");
  return chips.slice(0,3);
}

function plannerSavingsNote(x){
  var lo = x.cat.price[0], hi = x.cat.price[1];
  if (hi - lo < 40) return null;
  return "Budget-vetted picks in this category run ~$" + lo + ", vs $" + hi + "+ for premium models — we only recommend a step up when it genuinely changes the result.";
}
