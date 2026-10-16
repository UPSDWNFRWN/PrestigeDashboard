import tasksJson from './tasks.json';
import reqsJson from './reqs.json';
import llJson from './ll.json';
import preJson from './prereq.json';
import rewJson from './rewards.json';
import mapJson from './maps.json';
import hiddenJson from './hidden.json';
// Sources: BSG patch 1.2.0.0 (6 Oct 2026) via lfcarry.com/guides/tarkov-prestige, tarkov-market.com/progression/prestige, EFT wiki; Collector gates via EFT wiki (20 Sep 2026).
// All six cycles' unlock conditions were taken from the in-game PvE Prestige screens (supplied by the user, 11 Oct 2026).
// Re-checked 12 Oct 2026 against tarkov-market.com/progression/prestige (updated 11 Oct 2026): all six cycles match.
const H1={'Intelligence Center':1,'Nutrition Unit':2,'Rest Space':2},H2={'Intelligence Center':2,'Security':3,'Rest Space':3};
export const CYCLES=[
{p:1,lvl:25,rub:10,tasks:['New Beginning'],story:[],skills:{},hideout:H1},
{p:2,lvl:30,rub:15,tasks:['New Beginning'],story:['Tour'],skills:{Strength:10,Endurance:10,Charisma:7},hideout:H1},
{p:3,lvl:35,rub:15,tasks:['New Beginning'],story:['Tour','Falling Skies'],skills:{Strength:10,Endurance:10,Charisma:7},hideout:H1},
{p:4,lvl:40,rub:15,tasks:['New Beginning'],story:['Tour','Falling Skies','The Ticket from Tarkov'],skills:{Strength:15,Endurance:15,Charisma:12},hideout:H1},
{p:5,lvl:47,rub:20,tasks:['New Beginning','Collector'],story:['Tour','They Are Already Here','Falling Skies','The Ticket from Tarkov'],skills:{Strength:20,Endurance:20,Charisma:20},hideout:H2},
{p:6,lvl:47,rub:20,tasks:['New Beginning','Collector'],story:['Falling Skies','The Ticket'],skills:{Strength:20,Endurance:20,Charisma:20},hideout:H2}];
export const TRADERS=['Therapist','Prapor','Peacekeeper','Mechanic','Jaeger','Skier','Ragman'];
// Collector gate quests (EFT wiki snapshots, ~Aug 2026; Postman Pat - Part 2 added 13 Oct 2026 from the tarkov.dev PvE prerequisites). Sew it Good - Part 2: no map/objective data found. Tarkov Shooter 4 objective differs between sources.
export const CQUESTS=[
{id:'chem3',name:'Chemical - Part 3',giver:'Skier',obj:'Get the chemical-filled syringe (3rd-floor Factory offices, breach door), hand to Skier',maps:['Factory']},
{id:'sew2',name:'Sew it Good - Part 2',giver:'Ragman',obj:'Objectives/map not confirmed - check in-game',maps:[]},
{id:'tsh4',name:'The Tarkov Shooter - Part 4',giver:'Jaeger',obj:'Bolt-action rifle kills (wiki: 5 PMCs from 80m+; other sources: 15 any targets). Solo task',maps:['Any']},
{id:'pp2',name:'Postman Pat - Part 2',giver:'Therapist',obj:'Hand over the letter from Prapor\'s messenger (do Part 1 first). Any map',maps:['Any']},
{id:'sbih',name:'Shooter Born in Heaven',giver:'Mechanic',maps:[],obj:'20 PMC headshots with a bolt-action rifle: 5 per map pair. Needs Mechanic LL4',subs:[['Customs','Lighthouse'],['Streets of Tarkov','Shoreline'],['Interchange','Ground Zero'],['Woods','Reserve']],pick:['Customs','Shoreline','Ground Zero','Woods']}];
// Collector FIR hand-ins (44). Sources: timesaver.gg 1.1.5.x checklist (verified vs wiki, Sep 2026), tarkovforge 2026, EFT wiki. All 44 re-checked against the tarkov.dev PvE Collector task on 13 Oct 2026.
const CI=["42 Signature Blend English Tea", "Antique axe", "Axel parrot figurine", "BEAR Buddy plush toy", "Baddie's red beard", "BakeEzy cook book", "Battered antique book", "Bottle of YMXC water", "Can of Dr. Lupo's coffee beans", "Can of GigaBeef meat", "Can of RatCola soda", "Deadlyslob's beard oil", "DesmondPilak CD", "Domontovich ushanka hat", "DRD body armor", "Dunduk floppy disk", "Fake mustache", "#FireKlean gun lube", "French bakery baguette", "Gingy keychain", "Glorious E lightweight armored mask", "Golden 1GPhone smartphone", "Golden egg", "Inseq gas pipe wrench", "JohnB Liquid DNB glasses", "LM KC-130 model aircraft", "Loot Lord plushie", "LVNDMARK's rat poison", "Mazoni golden dumbbell", "Missam forklift key", "Nut Sack balaclava", "Pestily plague mask", "Press pass (issued for NoiceGuy)", "Raven figurine", "Shroud half-mask", "SheefGG piggy bank", "Silver Badge", "Smoke balaclava", "Tamatthi kunai knife replica", "Tigzresq splint", "Veritas guitar pick", "Video cassette with the Cyborg Killer movie", "Viibiin sneaker", "WZ Wallet"];
// A Collector gate quest is an ordinary trader task, so it is ticked under the same key as in the trader lists.
export const cqKey=q=>'tk:'+q.giver+':'+q.name;
export const COLLECTOR_ITEMS=CI.map(n=>({n,f:'ok'}));
// LL4 requirements (EFT wiki trader pages, Aug-Sep 2026, after the 1.1.0 rebalance): [character level, reputation]
export const TRADER_LL4={Prapor:[36,7.9],Therapist:[37,5.8],Skier:[38,5.8],Peacekeeper:[37,6.0],Mechanic:[40,7.6],Ragman:[42,6.5],Jaeger:[33,7.3]};
// Per-trader task lists, in the order supplied by the user. Add other traders by pasting their lists between the backticks (one task per line).
const lines=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean);
// Original Prapor list supplied by the user (kept for reference; not used). It mixes tasks that the current game data files under other traders.
export const PRAPOR_USER_LIST=lines(`
Shooting Cans
Debut
Luxurious Life
Properties All Around
Search Mission
Background Check
Shootout Picnic
Delivery from the Past
BP Depot
Bad Rep Evidence
Ice Cream Cones
Postman Pat - Part 1
Shaking up the Teller
The Punisher Part 1
The Punisher Part 2
The Punisher Part 3
The Punisher Part 4
The Punisher Part 5
The Punisher Part 6
Scrap Metal
Eagle Eye
Fishing Gear
Polikhim Hobo
Big Customer
No Offence
Grenadier
Test Drive Part 1
Test Drive Part 2
Test Drive Part 3
Test Drive Part 4
Test Drive Part 5
Regulated Materials
Intimidator
Escort
The Bunker Part 1
The Bunker Part 2
Capturing Outposts
Mentor
Special Comms
Worst Job in the World
Compound Interest
Return the Favor
Provocation
Best Job in the World
Kings of the Rooftops
Security Detail
Easy Job Part 1
Easy Job Part 2
Corporate Secrets
Population Census
Burning Rubber
Information Source
To Great Heights! Part 1
To Great Heights! Part 2
Reconnaissance
Trouble in the Big City
Pets Won't Need It Part 1
Pets Won't Need It Part 2
Rough Tarkov
Time-Locked
Every Hunter Knows This
They're Ready
The Last Helldiver
Forester's Duty
Work Smarter`);
// Current PvE task data, tarkov.dev game data (json.tarkov.dev/pve/tasks, 11 Oct 2026, patch 1.2.0.0), grouped by trader, ordered by level/prerequisites.
export const TRADER_TASKS=tasksJson;

// Per-task requirements from the same game data: 'Trader|Task' -> [min PMC level, 'Trader<LL>,...' loyalty requirements]. Tasks not listed unlock via earlier tasks only.
export const TASK_REQ=reqsJson;

// Loyalty-level group per task ('Trader|Task' -> 2..4; unlisted = LL1). Own-trader LL requirement from the game data, otherwise inherited from earlier same-trader tasks it depends on. Fence has no loyalty levels.
export const TASK_LL=llJson;

// Prerequisites ('Trader|Task' -> ['Trader|Required task', ...]) from the same game data. 'Other|' = a task from a trader not tracked here (BTR Driver, Ref, Lightkeeper, Arena...).
export const PREREQ=preJson;
export const TASK_REWARD=rewJson;
export const TASK_MAP=mapJson;
// Fence tasks gated by scav karma (tarkov.dev PvE game data, 10 Oct 2026: traderRequirements of type reputation).
export const FENCE_REP={'Is This a Reference?':['>=',1],'Collector':['>=',3],'Establish Contact':['>=',4],'Compensation for Damage - Trust':['<',-1],'Compensation for Damage - Wager':['<=',-1],'Compensation for Damage - Barkeep':['<=',-1],'Compensation for Damage - Collection':['<=',-1],'Compensation for Damage - Wergild':['<=',-3]};
// Tasks that only unlock if an earlier task was FAILED, which this planner cannot confirm.
export const FAILED_ONLY=[];
// Tasks whose game data carries an extra hidden requirement (a globalVariable counter, e.g. Escort needs variable >= 2) that this planner cannot read.
export const HIDDEN_REQ=new Set(hiddenJson);
