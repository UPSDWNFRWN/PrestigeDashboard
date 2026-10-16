// Story chapter steps, from the tarkovforge.com story guide (Oct 2026). A community source, not the in-game text: check against your quest log.
// Step: [id, text, map, flag, note]. flag 'o' = optional, 'b' = only on one route. Optional and route steps are not counted in progress.
const S=(id,t,m,f,n)=>({id,t,m,o:f==='o'||f==='b',f,n});
const TICKET=[
 S('k1','Build Intelligence Center level 1','Hideout'),
 S('k2','Talk to Mr. Kerman on the Intelligence Center laptop','Hideout'),
 S('k3','Wait for Mr. Kerman to reach out','Hideout',null,'Real-time wait of 2 to 6 hours'),
 S('k4','Talk to Prapor','Trader menu'),
 S('k5','Talk to Mr. Kerman again to report what Prapor said','Hideout'),
 S('k6','Locate Prapor\'s camp','Lighthouse','b','Only if you gave Prapor the armored case in Falling Skies. West rocky area'),
 S('k7','Find the note from Prapor\'s men','Lighthouse','b','Under the ammo box lid or on the log by the guitar tent'),
 S('k8','Talk to Mr. Kerman about your findings','Hideout','b','Unlocks "To the Light - Trust but Verify" from Mechanic'),
 S('k9','Gain access to Lightkeeper','Lighthouse','b','Needs an encoded Digital secure DSP radio transmitter first'),
 S('k10','Talk to Lightkeeper in person','Lighthouse','b'),
 S('k11','Stay on good terms with Lightkeeper until he returns the armored case','Lighthouse','b'),
 S('k12','Obtain 3 TerraGroup Blue Folders','Any','b','Not found-in-raid, flea market works'),
 S('k13','Hand the 3 Blue Folders to Lightkeeper','Lighthouse','b'),
 S('k14','Launch a yellow signal flare at the ULTRA main entrance','Interchange','b','RSP-30 (Yellow) or a ZiD SP-81 with a yellow 26x75mm flare'),
 S('k15','Eliminate 15 targets in a single raid','Interchange','b','Transits allowed, kills must be on Interchange. Extracting early means redoing the flare'),
 S('k16','Talk to Lightkeeper about the mission to receive the armored case','Lighthouse','b','Needs a free special slot'),
 S('k17','Obtain the experimental signal jammer','The Lab','','Required on every route. Needs a Labs access keycard'),
 S('k18','Talk to Mechanic about the jammer','Trader menu','o','Unlocks the armored case recipe'),
 S('k19','Unlock the armored case','Hideout',null,'Craft at Workbench level 1'),
 S('k20','Ask Mechanic for help opening the case','Trader menu','o'),
 S('k21','Obtain the ticket from the case','Stash',null,'Right-click the unlocked case and unpack it'),
 S('k22','Read the armored case instructions in the Handbook','Handbook'),
 S('k23','Contact Mr. Kerman with the ticket information','Hideout',null,'Point of no return: accepting commits you to the Kerman route'),
 S('k24','Make your final choice','Hideout',null,'Continue with Kerman, or refuse and pay Prapor (300M roubles if you gave him the case, 500M if you kept it)'),
];
export const STORY={
 'Tour':{req:'None. Starts with the Ground Zero tutorial raid.',steps:[
  S('t1','Escape Ground Zero','Ground Zero',null,'Extract at Klimov Street, behind the Skyside business center'),
  S('t2','Talk to Therapist','Trader menu'),
  S('t3','Ensure access to Streets of Tarkov','Streets',null,'Unlocked by handing Therapist 250,000 roubles'),
  S('t4','Hand 250,000 roubles to Therapist','Trader menu','o','Not found-in-raid'),
  S('t5','Ensure access to Interchange','Interchange',null,'Extract with Survived or Run Through, or visit three times'),
  S('t6','Ensure access to Customs','Customs',null,'Extract with Survived or Run Through, or visit three times'),
  S('t7','Hand 5 building materials to Skier','Any',null,'Found in raid. Unlocks Mechanic and Factory'),
  S('t8','Ensure access to Factory','Factory'),
  S('t9','Hand 2 weapons to Mechanic','Any',null,'Found in raid. Unlocks Prapor and Woods'),
  S('t10','Ensure access to Woods','Woods',null,'Kill any 3 targets, then extract or visit three times'),
  S('t11','Interact with the intercom','Shoreline',null,'South-east watchtower. Do not shoot the guards'),
  S('t12','Hand 5 PMC dogtags to Prapor','Trader menu','o','Any dogtags. Unlocks Reserve'),
  S('t13','Hand $8,000 to Mechanic','Trader menu','o','Unlocks Lighthouse'),
  S('t14','Locate and access The Lab','The Lab',null,'Needs a Labs access keycard. Opens one minute into a raid'),
  S('t15','Search the top management offices','The Lab',null,'Office O21, second level'),
  S('t16','Search the server room','The Lab',null,'First level, next to the hangar'),
  S('t17','Locate the escape path through the drainage system','The Lab',null,'Basement at the Sewage Conduit extract. No need to survive'),
 ]},
 'Falling Skies':{req:'Complete Tour. Prapor must be at loyalty level 2 (some game editions skip this).',steps:[
  S('f1','Locate the crashed plane','Woods',null,'Eastern side'),
  S('f2','Reach loyalty level 2 with Prapor','Trader menu'),
  S('f3','Ask Prapor, Therapist, Skier, Mechanic and Jaeger about the plane','Trader menu'),
  S('f4','Pay Therapist 2,000 roubles','Trader menu','o','Reveals the G-Wagon location'),
  S('f5','Retrieve the flash drive from the G-Wagon','Shoreline',null,'Found in raid. Driver-side running board, by the Tunnel extract'),
  S('f6','Hand the flash drive to Prapor','Trader menu',null,'Then wait 1 hour'),
  S('f7','Retrieve the flight recorder','Woods',null,'Found in raid. Right side of the plane, broken rear section'),
  S('f8','Stash the flight recorder in the destroyed room of the Fisher\'s Island house','Shoreline',null,'Do not hand it to a trader'),
  S('f9','Hand 2 Toolsets to Prapor','Trader menu',null,'Found in raid, or craft at Workbench 1'),
  S('f10','Hand 3 Rechargeable Batteries to Prapor','Trader menu',null,'Found in raid, or craft at Workbench 2'),
  S('f11','Hand 5 Printed Circuit Boards to Prapor','Trader menu',null,'Found in raid, or craft at Workbench 1. Then a 3 to 5 hour wait'),
  S('f12','Retrieve the plane crew transcript','Shoreline',null,'Chairman\'s House, under the mattress of the overturned bed'),
  S('f13','Retrieve Elektronik\'s flash drive','Shoreline',null,'Chairman\'s House, top of the shelf beside the bed'),
  S('f14','Hand the transcript and flash drive to Prapor','Trader menu',null,'Then answer his question after a 1 to 3 hour wait'),
  S('f15','Retrieve the armored case','Woods',null,'Behind the cockpit'),
  S('f16','Find Mr. Kerman\'s note','Woods','o','On the pilot seat next to the case'),
  S('f17','Make your final decision on the armored case','Trader menu',null,'Point of no return. Keep it, hand it to Prapor, or pretend you never found it first'),
 ]},
 'They Are Already Here':{req:'Follows the chapter The Unheard. Needs Intelligence Center level 1 to craft the restored pass.',steps:[
  S('h1','Read the Note about the Eye of the World','Customs / Reserve / Woods / Shoreline'),
  S('h2','Equip an audio recorder','Any'),
  S('h3','Locate a place connected to the Eye of the World','Lighthouse',null,'Cultist torture house'),
  S('h4','Listen to Cult victim audio tape #2','Lighthouse'),
  S('h5','Obtain the cult victim\'s apartment key','Lighthouse',null,'Found in raid. Four possible spawns in the same house'),
  S('h6','Locate the cult victim\'s apartment','Streets',null,'Apartment 5, third floor, old building behind Klimov mall'),
  S('h7','Breach the office door and investigate the apartment','Streets'),
  S('h8','Obtain and read the Book of the Arrival','Streets',null,'Office bookshelf'),
  S('h9','Obtain the note on preparations for the Arrival','Streets',null,'Office desk'),
  S('h10','Ask Mechanic about the Eye of the World','Trader menu'),
  S('h11','Locate and neutralize a Cultist priest','Any'),
  S('h12','Get more information from the priest\'s note','Customs / Streets / Reserve',null,'Customs dorms, Streets northern factory or Reserve. Each marked room needs its own key'),
  S('h13','Locate the Eye of the World place on Lighthouse','Lighthouse',null,'Northern blue chalet, small southern second-floor bedroom'),
  S('h14','Locate the Eye of the World place on Woods','Woods',null,'House in the dilapidated northern village'),
  S('h15','Locate and repair the Sordi tower','Shoreline',null,'Consumes a Toolset. Red shack at the radio tower'),
  S('h16','Ask Mechanic about Station 14-4 KORD','Trader menu'),
  S('h17','Craft the Station 14-4 KORD Arshavin K. pass (Restored)','Hideout',null,'Intelligence Center level 1, and the hideout needs power'),
  S('h18','Gain access to NGO Cobalt\'s secret facility','Interchange',null,'Power station basement, using the restored pass'),
  S('h19','Restore power at the station','Interchange'),
  S('h20','Turn on the cooling system','Interchange',null,'Lever at the back of the server room'),
  S('h21','Install the flash drive to download data','Interchange'),
  S('h22','Investigate ARRS Station 14-4 KORD','Interchange',null,'Mysterious audio tape in the entrance safe'),
  S('h23','Survive or Run Through and extract','Interchange'),
  S('h24','Find a way to disconnect the station from external agents','Interchange',null,'ARRS mechanic\'s notes on the big desk'),
  S('h25','Restore the ARRS station to backup settings','Interchange',null,'Button under the server room table'),
  S('h26','Collect the flash drive from the ARRS station','Interchange',null,'Do this after the backup restore'),
  S('h27','Survive or Run Through and extract again','Interchange'),
  S('h28','Hand the flash drive to Mechanic','Trader menu'),
  S('h29','Read the ARRS station specifications in the Handbook','Handbook'),
 ]},
 'The Ticket from Tarkov':{req:'Intelligence Center level 1. Chapter The Ticket, up to the step where you obtain the ticket from the case.',alias:'The Ticket',upTo:'k21',steps:TICKET},
 'The Ticket':{req:'Intelligence Center level 1. The whole chapter, to the final choice.',steps:TICKET},
};
STORY['The Ticket from Tarkov'].steps=TICKET.slice(0,TICKET.findIndex(x=>x.id==='k21')+1);
export const sKey=id=>'sp:'+id;
const hasFork=st=>st.steps.some(x=>x.f==='b');
// Route steps (flag 'b') only exist if you handed the armored case to Prapor. Until you say which, they stay uncounted.
export const stepsShown=(st,s)=>s.n.ticketCase==='kept'?st.steps.filter(x=>x.f!=='b'):st.steps;
export const requiredSteps=(name,s)=>{const st=STORY[name];if(!st)return [];const path=s.n.ticketCase==='prapor';return st.steps.filter(x=>x.f==='b'?path:!x.o)};
export const storyProgress=(name,s)=>{if(!STORY[name])return null;const req=requiredSteps(name,s);return {have:req.filter(x=>s.c[sKey(x.id)]).length,need:req.length}};
export const storyHasFork=n=>!!STORY[n]&&hasFork(STORY[n]);
// Kerman's later choices, in order. Each fork shows only if you reached it. Source: tarkovforge.com story guide (Oct 2026).
export const FORKS=[
 {k:'ticketA',q:'Contact Mr. Kerman with the ticket information: what did you choose?',o:[['accept','Accept Kerman'],['decline','Refuse and pay Prapor']],end:{decline:'Survivor'}},
 {k:'ticketB',after:['ticketA','accept'],q:'Kerman asks you to find dirt on TerraGroup. Do you agree?',o:[['agree','Agree'],['refuse','Refuse']],end:{refuse:'Fallen'}},
 {k:'ticketC',after:['ticketB','agree'],q:'How far did you take the evidence route?',o:[['all','Delivered 8 of the 9 evidence items'],['two','Stopped after 2 and refused to continue']],end:{all:'Savior',two:'Debtor'}},
];
export const ENDING_NOTE={Survivor:'Pay Prapor 300M roubles if you gave him the case, 500M if you kept it.',Fallen:'You leave with Prapor, paying the case with dangerous cargo plus $1,000,000.',Savior:'Reached by delivering 8 of the 9 major evidence items.',Debtor:'Reached by stopping after 2 evidence items.'};
export const forkEnding=n=>{for(const f of FORKS){if(f.after&&n[f.after[0]]!==f.after[1])return null;const v=n[f.k];if(!v)return null;if(f.end[v])return f.end[v]}return null};
