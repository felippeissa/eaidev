import{Aa as k,Da as N,Fa as H,c as A,e as S,h as V}from"./chunk-357IS2PP.js";import{$ as y,$a as I,Ab as B,Bb as i,Cb as T,Db as D,Ib as u,Ja as z,Jb as F,Kb as L,Ma as c,N as h,Rb as j,T as x,Xa as $,_,ba as p,bb as l,cc as d,ha as b,hb as g,ib as n,kb as C,lb as w,mb as v,sb as m,tb as f,ub as E,yb as M}from"./chunk-5OEIHN6B.js";var R=["*"];function q(a,o){if(a&1&&(m(0,"span",3),F(1),f()),a&2){let e=i();c(),L(e.label)}}function O(a,o){if(a&1&&E(0,"span",5),a&2){let e=i(2);v(e.icon),n("ngClass","p-avatar-icon")}}function U(a,o){if(a&1&&l(0,O,1,3,"span",4),a&2){let e=i(),r=u(5);n("ngIf",e.icon)("ngIfElse",r)}}function G(a,o){if(a&1){let e=M();m(0,"img",7),B("error",function(t){_(e);let s=i(2);return y(s.imageError(t))}),f()}if(a&2){let e=i(2);n("src",e.image,z),g("aria-label",e.ariaLabel)}}function J(a,o){if(a&1&&l(0,G,1,2,"img",6),a&2){let e=i();n("ngIf",e.image)}}var K=({dt:a})=>`
.p-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${a("avatar.width")};
    height: ${a("avatar.height")};
    font-size: ${a("avatar.font.size")};
    color: ${a("avatar.color")};
    background: ${a("avatar.background")};
    border-radius: ${a("avatar.border.radius")};
}

.p-avatar-image {
    background: transparent;
}

.p-avatar-circle {
    border-radius: 50%;
}

.p-avatar-circle img {
    border-radius: 50%;
}

.p-avatar-icon {
    font-size: ${a("avatar.icon.size")};
    width: ${a("avatar.icon.size")};
    height: ${a("avatar.icon.size")};
}

.p-avatar img {
    width: 100%;
    height: 100%;
}

.p-avatar-lg {
    width: ${a("avatar.lg.width")};
    height: ${a("avatar.lg.width")};
    font-size: ${a("avatar.lg.font.size")};
}

.p-avatar-lg .p-avatar-icon {
    font-size: ${a("avatar.lg.icon.size")};
    width: ${a("avatar.lg.icon.size")};
    height: ${a("avatar.lg.icon.size")};
}

.p-avatar-xl {
    width: ${a("avatar.xl.width")};
    height: ${a("avatar.xl.width")};
    font-size: ${a("avatar.xl.font.size")};
}

.p-avatar-xl .p-avatar-icon {
    font-size: ${a("avatar.xl.font.size")};
    width: ${a("avatar.xl.icon.size")};
    height: ${a("avatar.xl.icon.size")};
}

.p-avatar-group {
    display: flex;
    align-items: center;
}

.p-avatar-group .p-avatar + .p-avatar {
    margin-inline-start: ${a("avatar.group.offset")};
}

.p-avatar-group .p-avatar {
    border: 2px solid ${a("avatar.group.border.color")};
}

.p-avatar-group .p-avatar-lg + .p-avatar-lg {
    margin-inline-start: ${a("avatar.lg.group.offset")};
}

.p-avatar-group .p-avatar-xl + .p-avatar-xl {
    margin-inline-start: ${a("avatar.xl.group.offset")};
}
`,Q={root:({props:a})=>["p-avatar p-component",{"p-avatar-image":a.image!=null,"p-avatar-circle":a.shape==="circle","p-avatar-lg":a.size==="large","p-avatar-xl":a.size==="xlarge"}],label:"p-avatar-label",icon:"p-avatar-icon"},P=(()=>{class a extends N{name="avatar";theme=K;classes=Q;static \u0275fac=(()=>{let e;return function(t){return(e||(e=p(a)))(t||a)}})();static \u0275prov=h({token:a,factory:a.\u0275fac})}return a})();var ma=(()=>{class a extends H{label;icon;image;size="normal";shape="square";style;styleClass;ariaLabel;ariaLabelledBy;onImageError=new b;_componentStyle=x(P);imageError(e){this.onImageError.emit(e)}get hostClass(){return this.styleClass}static \u0275fac=(()=>{let e;return function(t){return(e||(e=p(a)))(t||a)}})();static \u0275cmp=$({type:a,selectors:[["p-avatar"]],hostVars:19,hostBindings:function(r,t){r&2&&(g("data-pc-name","avatar")("aria-label",t.ariaLabel)("aria-labelledby",t.ariaLabelledBy),w(t.style),v(t.hostClass),C("p-avatar",!0)("p-component",!0)("p-avatar-circle",t.shape==="circle")("p-avatar-lg",t.size==="large")("p-avatar-xl",t.size==="xlarge")("p-avatar-image",t.image!=null))},inputs:{label:"label",icon:"icon",image:"image",size:"size",shape:"shape",style:"style",styleClass:"styleClass",ariaLabel:"ariaLabel",ariaLabelledBy:"ariaLabelledBy"},outputs:{onImageError:"onImageError"},features:[j([P]),I],ngContentSelectors:R,decls:6,vars:2,consts:[["iconTemplate",""],["imageTemplate",""],["class","p-avatar-text",4,"ngIf","ngIfElse"],[1,"p-avatar-text"],[3,"class","ngClass",4,"ngIf","ngIfElse"],[3,"ngClass"],[3,"src","error",4,"ngIf"],[3,"error","src"]],template:function(r,t){if(r&1&&(T(),D(0),l(1,q,2,1,"span",2)(2,U,1,2,"ng-template",null,0,d)(4,J,1,1,"ng-template",null,1,d)),r&2){let s=u(3);c(),n("ngIf",t.label)("ngIfElse",s)}},dependencies:[V,A,S,k],encapsulation:2,changeDetection:0})}return a})();export{ma as a};
