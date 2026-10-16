// Which build of the current version this is. REV is always 0 now: experimental features ship inside every release (there is no separate experimental build).
// The revision part is kept so the update check can still tell two builds of one version apart if a hotfix ever needs it; it shows as "E" after the version when it is above 0.
export const REV=0;
export const BUILD_ID=(v,r=REV)=>v+(r>0?'E'+(r>1?r:''):'');
