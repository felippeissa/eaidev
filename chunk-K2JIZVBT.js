import{a as ee}from"./chunk-WQWC6ODZ.js";import{c as K,d as v,f as T,h as w}from"./chunk-OFLOCURC.js";import{Aa as W,Da as X,Fa as Z,Na as se,c as V,e as Y,g as G,h as J,za as U}from"./chunk-IXKC2M47.js";import{$ as M,Ab as S,Cb as R,Db as t,Eb as j,Fb as B,Gb as d,Ib as b,Ja as F,Jb as _,Mb as A,N as k,Na as c,Nb as L,Ob as P,T as z,Wb as N,Yb as y,Za as D,Zb as q,_ as I,bb as Q,ca as x,db as r,hc as H,ia as O,jb as $,kb as i,oa as E,oc as C,pb as l,ub as p,vb as u,wb as f,zb as h}from"./chunk-4CMEKOL3.js";var ne=["container"],te=["icon"],ie=["closeicon"],ae=["*"],ce=(e,n)=>({showTransitionParams:e,hideTransitionParams:n}),re=e=>({value:"visible()",params:e}),le=e=>({closeCallback:e});function me(e,n){e&1&&h(0)}function ge(e,n){if(e&1&&r(0,me,1,0,"ng-container",7),e&2){let s=t(2);i("ngTemplateOutlet",s.iconTemplate||s.iconTemplate)}}function pe(e,n){if(e&1&&f(0,"i",3),e&2){let s=t(2);i("ngClass",s.icon)}}function ue(e,n){if(e&1&&f(0,"span",9),e&2){let s=t(3);i("ngClass",s.cx("text"))("innerHTML",s.text,F)}}function fe(e,n){if(e&1&&(p(0,"div"),r(1,ue,1,2,"span",8),u()),e&2){let s=t(2);c(),i("ngIf",!s.escape)}}function de(e,n){if(e&1&&(p(0,"span",5),L(1),u()),e&2){let s=t(3);i("ngClass",s.cx("text")),c(),P(s.text)}}function be(e,n){if(e&1&&r(0,de,2,2,"span",10),e&2){let s=t(2);i("ngIf",s.escape&&s.text)}}function _e(e,n){e&1&&h(0)}function he(e,n){if(e&1&&r(0,_e,1,0,"ng-container",11),e&2){let s=t(2);i("ngTemplateOutlet",s.containerTemplate||s.containerTemplate)("ngTemplateOutletContext",y(2,le,s.close.bind(s)))}}function xe(e,n){if(e&1&&(p(0,"span",5),B(1),u()),e&2){let s=t(2);i("ngClass",s.cx("text"))}}function $e(e,n){if(e&1&&f(0,"i",13),e&2){let s=t(3);i("ngClass",s.closeIcon)}}function ye(e,n){e&1&&h(0)}function Ce(e,n){if(e&1&&r(0,ye,1,0,"ng-container",7),e&2){let s=t(3);i("ngTemplateOutlet",s.closeIconTemplate||s._closeIconTemplate)}}function ve(e,n){e&1&&f(0,"TimesIcon",14)}function Te(e,n){if(e&1){let s=S();p(0,"button",12),R("click",function(a){I(s);let g=t(2);return M(g.close(a))}),r(1,$e,1,1,"i",13)(2,Ce,1,1,"ng-container")(3,ve,1,0,"TimesIcon",14),u()}if(e&2){let s=t(2);$("aria-label",s.closeAriaLabel),c(),l(s.closeIcon?1:-1),c(),l(s.closeIconTemplate||s._closeIconTemplate?2:-1),c(),l(!s.closeIconTemplate&&!s._closeIconTemplate&&!s.closeIcon?3:-1)}}function we(e,n){if(e&1&&(p(0,"div",1)(1,"div",2),r(2,ge,1,1,"ng-container")(3,pe,1,1,"i",3)(4,fe,2,1,"div",4)(5,be,1,1,"ng-template",null,0,H)(7,he,1,4,"ng-container")(8,xe,2,1,"span",5)(9,Te,4,4,"button",6),u()()),e&2){let s=A(6),o=t();i("ngClass",o.containerClass)("@messageAnimation",y(13,re,q(10,ce,o.showTransitionOptions,o.hideTransitionOptions))),$("aria-live","polite")("role","alert"),c(2),l(o.iconTemplate||o._iconTemplate?2:-1),c(),l(o.icon?3:-1),c(),i("ngIf",!o.escape)("ngIfElse",s),c(3),l(o.containerTemplate||o._containerTemplate?7:8),c(2),l(o.closable?9:-1)}}var ke=({dt:e})=>`
.p-message {
    border-radius: ${e("message.border.radius")};
    outline-width: ${e("message.border.width")};
    outline-style: solid;
}

.p-message-content {
    display: flex;
    align-items: center;
    padding: ${e("message.content.padding")};
    gap: ${e("message.content.gap")};
    height: 100%;
}

.p-message-icon {
    flex-shrink: 0;
}

.p-message-close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-inline-start: auto;
    overflow: hidden;
    position: relative;
    width: ${e("message.close.button.width")};
    height: ${e("message.close.button.height")};
    border-radius: ${e("message.close.button.border.radius")};
    background: transparent;
    transition: background ${e("message.transition.duration")}, color ${e("message.transition.duration")}, outline-color ${e("message.transition.duration")}, box-shadow ${e("message.transition.duration")}, opacity 0.3s;
    outline-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
    cursor: pointer;
    user-select: none;
}

.p-message-close-icon {
    font-size: ${e("message.close.icon.size")};
    width: ${e("message.close.icon.size")};
    height: ${e("message.close.icon.size")};
}

.p-message-close-button:focus-visible {
    outline-width: ${e("message.close.button.focus.ring.width")};
    outline-style: ${e("message.close.button.focus.ring.style")};
    outline-offset: ${e("message.close.button.focus.ring.offset")};
}

.p-message-info {
    background: ${e("message.info.background")};
    outline-color: ${e("message.info.border.color")};
    color: ${e("message.info.color")};
    box-shadow: ${e("message.info.shadow")};
}

.p-message-info .p-message-close-button:focus-visible {
    outline-color: ${e("message.info.close.button.focus.ring.color")};
    box-shadow: ${e("message.info.close.button.focus.ring.shadow")};
}

.p-message-info .p-message-close-button:hover {
    background: ${e("message.info.close.button.hover.background")};
}

.p-message-info.p-message-outlined {
    color: ${e("message.info.outlined.color")};
    outline-color: ${e("message.info.outlined.border.color")};
}

.p-message-info.p-message-simple {
    color: ${e("message.info.simple.color")};
}

.p-message-success {
    background: ${e("message.success.background")};
    outline-color: ${e("message.success.border.color")};
    color: ${e("message.success.color")};
    box-shadow: ${e("message.success.shadow")};
}

.p-message-success .p-message-close-button:focus-visible {
    outline-color: ${e("message.success.close.button.focus.ring.color")};
    box-shadow: ${e("message.success.close.button.focus.ring.shadow")};
}

.p-message-success .p-message-close-button:hover {
    background: ${e("message.success.close.button.hover.background")};
}

.p-message-success.p-message-outlined {
    color: ${e("message.success.outlined.color")};
    outline-color: ${e("message.success.outlined.border.color")};
}

.p-message-success.p-message-simple {
    color: ${e("message.success.simple.color")};
}

.p-message-warn {
    background: ${e("message.warn.background")};
    outline-color: ${e("message.warn.border.color")};
    color: ${e("message.warn.color")};
    box-shadow: ${e("message.warn.shadow")};
}

.p-message-warn .p-message-close-button:focus-visible {
    outline-color: ${e("message.warn.close.button.focus.ring.color")};
    box-shadow: ${e("message.warn.close.button.focus.ring.shadow")};
}

.p-message-warn .p-message-close-button:hover {
    background: ${e("message.warn.close.button.hover.background")};
}

.p-message-warn.p-message-outlined {
    color: ${e("message.warn.outlined.color")};
    outline-color: ${e("message.warn.outlined.border.color")};
}

.p-message-warn.p-message-simple {
    color: ${e("message.warn.simple.color")};
}

.p-message-error {
    background: ${e("message.error.background")};
    outline-color: ${e("message.error.border.color")};
    color: ${e("message.error.color")};
    box-shadow: ${e("message.error.shadow")};
}

.p-message-error .p-message-close-button:focus-visible {
    outline-color: ${e("message.error.close.button.focus.ring.color")};
    box-shadow: ${e("message.error.close.button.focus.ring.shadow")};
}

.p-message-error .p-message-close-button:hover {
    background: ${e("message.error.close.button.hover.background")};
}

.p-message-error.p-message-outlined {
    color: ${e("message.error.outlined.color")};
    outline-color: ${e("message.error.outlined.border.color")};
}

.p-message-error.p-message-simple {
    color: ${e("message.error.simple.color")};
}

.p-message-secondary {
    background: ${e("message.secondary.background")};
    outline-color: ${e("message.secondary.border.color")};
    color: ${e("message.secondary.color")};
    box-shadow: ${e("message.secondary.shadow")};
}

.p-message-secondary .p-message-close-button:focus-visible {
    outline-color: ${e("message.secondary.close.button.focus.ring.color")};
    box-shadow: ${e("message.secondary.close.button.focus.ring.shadow")};
}

.p-message-secondary .p-message-close-button:hover {
    background: ${e("message.secondary.close.button.hover.background")};
}

.p-message-secondary.p-message-outlined {
    color: ${e("message.secondary.outlined.color")};
    outline-color: ${e("message.secondary.outlined.border.color")};
}

.p-message-secondary.p-message-simple {
    color: ${e("message.secondary.simple.color")};
}

.p-message-contrast {
    background: ${e("message.contrast.background")};
    outline-color: ${e("message.contrast.border.color")};
    color: ${e("message.contrast.color")};
    box-shadow: ${e("message.contrast.shadow")};
}

.p-message-contrast .p-message-close-button:focus-visible {
    outline-color: ${e("message.contrast.close.button.focus.ring.color")};
    box-shadow: ${e("message.contrast.close.button.focus.ring.shadow")};
}

.p-message-contrast .p-message-close-button:hover {
    background: ${e("message.contrast.close.button.hover.background")};
}

.p-message-contrast.p-message-outlined {
    color: ${e("message.contrast.outlined.color")};
    outline-color: ${e("message.contrast.outlined.border.color")};
}

.p-message-contrast.p-message-simple {
    color: ${e("message.contrast.simple.color")};
}

.p-message-text {
    display: inline-flex;
    align-items: center;
    font-size: ${e("message.text.font.size")};
    font-weight: ${e("message.text.font.weight")};
}

.p-message-icon {
    font-size: ${e("message.icon.size")};
    width: ${e("message.icon.size")};
    height: ${e("message.icon.size")};
}

.p-message-enter-from {
    opacity: 0;
}

.p-message-enter-active {
    transition: opacity 0.3s;
}

.p-message.p-message-leave-from {
    max-height: 1000px;
}

.p-message.p-message-leave-to {
    max-height: 0;
    opacity: 0;
    margin: 0;
}

.p-message-leave-active {
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1), opacity 0.3s, margin 0.3s;
}

.p-message-leave-active .p-message-close-button {
    opacity: 0;
}

.p-message-sm .p-message-content {
    padding: ${e("message.content.sm.padding")};
}

.p-message-sm .p-message-text {
    font-size: ${e("message.text.sm.font.size")};
}

.p-message-sm .p-message-icon {
    font-size: ${e("message.icon.sm.size")};
    width: ${e("message.icon.sm.size")};
    height: ${e("message.icon.sm.size")};
}

.p-message-sm .p-message-close-icon {
    font-size: ${e("message.close.icon.sm.size")};
    width: ${e("message.close.icon.sm.size")};
    height: ${e("message.close.icon.sm.size")};
}

.p-message-lg .p-message-content {
    padding: ${e("message.content.lg.padding")};
}

.p-message-lg .p-message-text {
    font-size: ${e("message.text.lg.font.size")};
}

.p-message-lg .p-message-icon {
    font-size: ${e("message.icon.lg.size")};
    width: ${e("message.icon.lg.size")};
    height: ${e("message.icon.lg.size")};
}

.p-message-lg .p-message-close-icon {
    font-size: ${e("message.close.icon.lg.size")};
    width: ${e("message.close.icon.lg.size")};
    height: ${e("message.close.icon.lg.size")};
}

.p-message-outlined {
    background: transparent;
    outline-width: ${e("message.outlined.border.width")};
}

.p-message-simple {
    background: transparent;
    outline-color: transparent;
    box-shadow: none;
}

.p-message-simple .p-message-content {
    padding: ${e("message.simple.content.padding")};
}

.p-message-outlined .p-message-close-button:hover,
.p-message-simple .p-message-close-button:hover {
    background: transparent;
}`,ze={root:({props:e})=>["p-message p-component p-message-"+e.severity,{"p-message-simple":e.variant==="simple"}],content:"p-message-content",icon:"p-message-icon",text:"p-message-text",closeButton:"p-message-close-button",closeIcon:"p-message-close-icon"},oe=(()=>{class e extends X{name="message";theme=ke;classes=ze;static \u0275fac=(()=>{let s;return function(a){return(s||(s=x(e)))(a||e)}})();static \u0275prov=k({token:e,factory:e.\u0275fac})}return e})();var Ke=(()=>{class e extends Z{severity="info";text;escape=!0;style;styleClass;closable=!1;icon;closeIcon;life;showTransitionOptions="300ms ease-out";hideTransitionOptions="200ms cubic-bezier(0.86, 0, 0.07, 1)";size;variant;onClose=new O;get closeAriaLabel(){return this.config.translation.aria?this.config.translation.aria.close:void 0}get containerClass(){let s=this.variant==="outlined"?"p-message-outlined":this.variant==="simple"?"p-message-simple":"",o=this.size==="small"?"p-message-sm":this.size==="large"?"p-message-lg":"";return`p-message-${this.severity} ${s} ${o}`.trim()+(this.styleClass?" "+this.styleClass:"")}visible=E(!0);_componentStyle=z(oe);containerTemplate;iconTemplate;closeIconTemplate;templates;_containerTemplate;_iconTemplate;_closeIconTemplate;ngOnInit(){super.ngOnInit(),this.life&&setTimeout(()=>{this.visible.set(!1)},this.life)}ngAfterContentInit(){this.templates?.forEach(s=>{switch(s.getType()){case"container":this._containerTemplate=s.template;break;case"icon":this._iconTemplate=s.template;break;case"closeicon":this._closeIconTemplate=s.template;break}})}close(s){this.visible.set(!1),this.onClose.emit({originalEvent:s})}static \u0275fac=(()=>{let s;return function(a){return(s||(s=x(e)))(a||e)}})();static \u0275cmp=D({type:e,selectors:[["p-message"]],contentQueries:function(o,a,g){if(o&1&&(d(g,ne,4),d(g,te,4),d(g,ie,4),d(g,U,4)),o&2){let m;b(m=_())&&(a.containerTemplate=m.first),b(m=_())&&(a.iconTemplate=m.first),b(m=_())&&(a.closeIconTemplate=m.first),b(m=_())&&(a.templates=m)}},inputs:{severity:"severity",text:"text",escape:[2,"escape","escape",C],style:"style",styleClass:"styleClass",closable:[2,"closable","closable",C],icon:"icon",closeIcon:"closeIcon",life:"life",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",size:"size",variant:"variant"},outputs:{onClose:"onClose"},features:[N([oe]),Q],ngContentSelectors:ae,decls:1,vars:1,consts:[["escapeOut",""],[1,"p-message","p-component",3,"ngClass"],[1,"p-message-content"],[1,"p-message-icon",3,"ngClass"],[4,"ngIf","ngIfElse"],[3,"ngClass"],["pRipple","","type","button",1,"p-message-close-button"],[4,"ngTemplateOutlet"],[3,"ngClass","innerHTML",4,"ngIf"],[3,"ngClass","innerHTML"],[3,"ngClass",4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["pRipple","","type","button",1,"p-message-close-button",3,"click"],[1,"p-message-close-icon",3,"ngClass"],["styleClass","p-message-close-icon"]],template:function(o,a){o&1&&(j(),r(0,we,10,15,"div",1)),o&2&&l(a.visible()?0:-1)},dependencies:[J,V,Y,G,ee,se,W],encapsulation:2,data:{animation:[K("messageAnimation",[w(":enter",[T({opacity:0,transform:"translateY(-25%)"}),v("{{showTransitionParams}}")]),w(":leave",[v("{{hideTransitionParams}}",T({height:0,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0,opacity:0}))])])]},changeDetection:0})}return e})();export{Ke as a};
