import{Aa as h,Da as g,Fa as y,h as m}from"./chunk-IXKC2M47.js";import{Eb as p,Fb as d,N as s,T as c,Wb as u,Za as r,bb as l,ca as o,mb as a,ob as f}from"./chunk-4CMEKOL3.js";var D=["*"],$=({dt:e})=>`
.p-iconfield {
    position: relative;
    display: block;
}

.p-inputicon {
    position: absolute;
    top: 50%;
    margin-top: calc(-1 * (${e("icon.size")} / 2));
    color: ${e("iconfield.icon.color")};
    line-height: 1;
}

.p-iconfield .p-inputicon:first-child {
    inset-inline-start: ${e("form.field.padding.x")};
}

.p-iconfield .p-inputicon:last-child {
    inset-inline-end: ${e("form.field.padding.x")};
}

.p-iconfield .p-inputtext:not(:first-child) {
    padding-inline-start: calc((${e("form.field.padding.x")} * 2) + ${e("icon.size")});
}

.p-iconfield .p-inputtext:not(:last-child) {
    padding-inline-end: calc((${e("form.field.padding.x")} * 2) + ${e("icon.size")});
}

.p-iconfield:has(.p-inputfield-sm) .p-inputicon {
    font-size: ${e("form.field.sm.font.size")};
    width: ${e("form.field.sm.font.size")};
    height: ${e("form.field.sm.font.size")};
    margin-top: calc(-1 * (${e("form.field.sm.font.size")} / 2));
}

.p-iconfield:has(.p-inputfield-lg) .p-inputicon {
    font-size: ${e("form.field.lg.font.size")};
    width: ${e("form.field.lg.font.size")};
    height: ${e("form.field.lg.font.size")};
    margin-top: calc(-1 * (${e("form.field.lg.font.size")} / 2));
}
`,j={root:"p-iconfield"},I=(()=>{class e extends g{name="iconfield";theme=$;classes=j;static \u0275fac=(()=>{let i;return function(t){return(i||(i=o(e)))(t||e)}})();static \u0275prov=s({token:e,factory:e.\u0275fac})}return e})();var _=(()=>{class e extends y{iconPosition="left";get _styleClass(){return this.styleClass}styleClass;_componentStyle=c(I);static \u0275fac=(()=>{let i;return function(t){return(i||(i=o(e)))(t||e)}})();static \u0275cmp=r({type:e,selectors:[["p-iconfield"],["p-iconField"],["p-icon-field"]],hostAttrs:[1,"p-iconfield"],hostVars:6,hostBindings:function(n,t){n&2&&(f(t._styleClass),a("p-iconfield-left",t.iconPosition==="left")("p-iconfield-right",t.iconPosition==="right"))},inputs:{iconPosition:"iconPosition",styleClass:"styleClass"},features:[u([I]),l],ngContentSelectors:D,decls:1,vars:0,template:function(n,t){n&1&&(p(),d(0))},dependencies:[m],encapsulation:2,changeDetection:0})}return e})();var B=["*"],z={root:"p-inputicon"},v=(()=>{class e extends g{name="inputicon";classes=z;static \u0275fac=(()=>{let i;return function(t){return(i||(i=o(e)))(t||e)}})();static \u0275prov=s({token:e,factory:e.\u0275fac})}return e})(),Z=(()=>{class e extends y{styleClass;get hostClasses(){return this.styleClass}_componentStyle=c(v);static \u0275fac=(()=>{let i;return function(t){return(i||(i=o(e)))(t||e)}})();static \u0275cmp=r({type:e,selectors:[["p-inputicon"],["p-inputIcon"]],hostVars:4,hostBindings:function(n,t){n&2&&(f(t.hostClasses),a("p-inputicon",!0))},inputs:{styleClass:"styleClass"},features:[u([v]),l],ngContentSelectors:B,decls:1,vars:0,template:function(n,t){n&1&&(p(),d(0))},dependencies:[m,h],encapsulation:2,changeDetection:0})}return e})();export{_ as a,Z as b};
