import{Aa as O,Da as z,Fa as A,c as $,e as j,f as E,g as N,h as Q,za as V}from"./chunk-357IS2PP.js";import{$a as T,Bb as m,Eb as f,Gb as v,Hb as y,Jb as S,Ma as a,Mb as I,N as C,Rb as M,T as _,Tb as B,Ub as F,Xa as w,ba as g,bb as b,hb as s,ib as i,jb as c,jc as P,kc as D,mb as u,sb as l,tb as p,ub as k,xb as x}from"./chunk-5OEIHN6B.js";var R=["content"],G=(e,o)=>({"p-progressbar p-component":!0,"p-progressbar-determinate":e,"p-progressbar-indeterminate":o}),H=e=>({$implicit:e});function J(e,o){if(e&1&&(l(0,"div"),S(1),p()),e&2){let t=m(2);c("display",t.value!=null&&t.value!==0?"flex":"none"),s("data-pc-section","label"),a(),I("",t.value,"",t.unit,"")}}function K(e,o){e&1&&x(0)}function L(e,o){if(e&1&&(l(0,"div",3)(1,"div",4),b(2,J,2,5,"div",5)(3,K,1,0,"ng-container",6),p()()),e&2){let t=m();u(t.valueStyleClass),c("width",t.value+"%")("background",t.color),i("ngClass","p-progressbar-value p-progressbar-value-animate"),s("data-pc-section","value"),a(2),i("ngIf",t.showValue&&!t.contentTemplate&&!t._contentTemplate),a(),i("ngTemplateOutlet",t.contentTemplate||t._contentTemplate)("ngTemplateOutletContext",B(11,H,t.value))}}function U(e,o){if(e&1&&(l(0,"div",7),k(1,"div",8),p()),e&2){let t=m();u(t.valueStyleClass),i("ngClass","p-progressbar-indeterminate-container"),s("data-pc-section","container"),a(),c("background",t.color),s("data-pc-section","value")}}var W=({dt:e})=>`
.p-progressbar {
    position: relative;
    overflow: hidden;
    height: ${e("progressbar.height")};
    background: ${e("progressbar.background")};
    border-radius: ${e("progressbar.border.radius")};
}

.p-progressbar-value {
    margin: 0;
    background: ${e("progressbar.value.background")};
}

.p-progressbar-label {
    color: ${e("progressbar.label.color")};
    font-size: ${e("progressbar.label.font.size")};
    font-weight: ${e("progressbar.label.font.weight")};
}

.p-progressbar-determinate .p-progressbar-value {
    height: 100%;
    width: 0%;
    position: absolute;
    display: none;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: width 1s ease-in-out;
}

.p-progressbar-determinate .p-progressbar-label {
    display: inline-flex;
}

.p-progressbar-indeterminate .p-progressbar-value::before {
    content: "";
    position: absolute;
    background: inherit;
    top: 0;
    inset-inline-start: 0;
    bottom: 0;
    will-change: inset-inline-start, inset-inline-end;
    animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}

.p-progressbar-indeterminate .p-progressbar-value::after {
    content: "";
    position: absolute;
    background: inherit;
    top: 0;
    inset-inline-start: 0;
    bottom: 0;
    will-change: inset-inline-start, inset-inline-end;
    animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
    animation-delay: 1.15s;
}

@-webkit-keyframes p-progressbar-indeterminate-anim {
    0% {
        inset-inline-start: -35%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
    100% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
}
@keyframes p-progressbar-indeterminate-anim {
    0% {
        inset-inline-start: -35%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
    100% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
}
@-webkit-keyframes p-progressbar-indeterminate-anim-short {
    0% {
        inset-inline-start: -200%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
    100% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
}
@keyframes p-progressbar-indeterminate-anim-short {
    0% {
        inset-inline-start: -200%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
    100% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
}
`,X={root:({instance:e})=>["p-progressbar p-component",{"p-progressbar-determinate":e.determinate,"p-progressbar-indeterminate":e.indeterminate}],value:"p-progressbar-value",label:"p-progressbar-label"},q=(()=>{class e extends z{name="progressbar";theme=W;classes=X;static \u0275fac=(()=>{let t;return function(n){return(t||(t=g(e)))(n||e)}})();static \u0275prov=C({token:e,factory:e.\u0275fac})}return e})();var be=(()=>{class e extends A{value;showValue=!0;styleClass;valueStyleClass;style;unit="%";mode="determinate";color;contentTemplate;_componentStyle=_(q);templates;_contentTemplate;ngAfterContentInit(){this.templates?.forEach(t=>{t.getType()==="content"?this._contentTemplate=t.template:this._contentTemplate=t.template})}static \u0275fac=(()=>{let t;return function(n){return(t||(t=g(e)))(n||e)}})();static \u0275cmp=w({type:e,selectors:[["p-progressBar"],["p-progressbar"],["p-progress-bar"]],contentQueries:function(r,n,h){if(r&1&&(f(h,R,4),f(h,V,4)),r&2){let d;v(d=y())&&(n.contentTemplate=d.first),v(d=y())&&(n.templates=d)}},inputs:{value:[2,"value","value",D],showValue:[2,"showValue","showValue",P],styleClass:"styleClass",valueStyleClass:"valueStyleClass",style:"style",unit:"unit",mode:"mode",color:"color"},features:[M([q]),T],decls:3,vars:15,consts:[["role","progressbar",3,"ngStyle","ngClass"],["style","display:flex",3,"ngClass","class","width","background",4,"ngIf"],[3,"ngClass","class",4,"ngIf"],[2,"display","flex",3,"ngClass"],[1,"p-progressbar-label"],[3,"display",4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[3,"ngClass"],[1,"p-progressbar-value","p-progressbar-value-animate"]],template:function(r,n){r&1&&(l(0,"div",0),b(1,L,4,13,"div",1)(2,U,2,7,"div",2),p()),r&2&&(u(n.styleClass),i("ngStyle",n.style)("ngClass",F(12,G,n.mode==="determinate",n.mode==="indeterminate")),s("aria-valuemin",0)("aria-valuenow",n.value)("aria-valuemax",100)("data-pc-name","progressbar")("data-pc-section","root")("aria-label",n.value+n.unit),a(),i("ngIf",n.mode==="determinate"),a(),i("ngIf",n.mode==="indeterminate"))},dependencies:[Q,$,j,N,E,O],encapsulation:2,changeDetection:0})}return e})();export{be as a};
