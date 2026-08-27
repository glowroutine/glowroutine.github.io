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
    img:"designer-perfume-organizers-atomizer-sets.jpg" }
];

var PLANNER_CONCERNS = [
  { key:"skincare", label:"Skin & anti-aging", icon:"✨" },
  { key:"hair", label:"Hair styling & health", icon:"💇" },
  { key:"makeup", label:"Makeup & vanity", icon:"💄" },
  { key:"bath", label:"Bath, relaxation & recovery", icon:"🛁" }
];

var PLANNER_PRIORITIES = [
  { key:"results", label:"Visible results over time", icon:"📈" },
  { key:"protection", label:"Damage prevention", icon:"🛡️" },
  { key:"organization", label:"Organization & tidiness", icon:"🗂️" },
  { key:"relaxation", label:"Relaxation / self-care", icon:"🌸" },
  { key:"convenience", label:"Quick & low-effort", icon:"⚡" },
  { key:"luxury", label:"Elevated / gift-worthy", icon:"🎁" }
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
