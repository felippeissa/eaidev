import{Aa as b,Da as v,Fa as S,c as y,f as g,h as k}from"./chunk-IXKC2M47.js";import{N as r,T as l,Wb as f,Za as c,a as o,b as a,bb as d,ca as s,jb as m,kb as p,ob as u,wb as h}from"./chunk-4CMEKOL3.js";var M=({dt:e})=>`
.p-skeleton {
    overflow: hidden;
    background: ${e("skeleton.background")};
    border-radius: ${e("skeleton.border.radius")};
}

.p-skeleton::after {
    content: "";
    animation: p-skeleton-animation 1.2s infinite;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 1;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), ${e("skeleton.animation.background")}, rgba(255, 255, 255, 0));
}

[dir='rtl'] .p-skeleton::after {
    animation-name: p-skeleton-animation-rtl;
}

.p-skeleton-circle {
    border-radius: 50%;
}

.p-skeleton-animation-none::after {
    animation: none;
}

@keyframes p-skeleton-animation {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
}

@keyframes p-skeleton-animation-rtl {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(-100%);
    }
}
`,w={root:{position:"relative"}},D={root:({props:e})=>["p-skeleton p-component",{"p-skeleton-circle":e.shape==="circle","p-skeleton-animation-none":e.animation==="none"}]},C=(()=>{class e extends v{name="skeleton";theme=M;classes=D;inlineStyles=w;static \u0275fac=(()=>{let t;return function(i){return(t||(t=s(e)))(i||e)}})();static \u0275prov=r({token:e,factory:e.\u0275fac})}return e})();var A=(()=>{class e extends S{styleClass;style;shape="rectangle";animation="wave";borderRadius;size;width="100%";height="1rem";_componentStyle=l(C);containerClass(){return{"p-skeleton p-component":!0,"p-skeleton-circle":this.shape==="circle","p-skeleton-animation-none":this.animation==="none"}}get containerStyle(){let t=this._componentStyle?.inlineStyles.root,n;return this.size?n=a(o(o({},this.style),t),{width:this.size,height:this.size,borderRadius:this.borderRadius}):n=o(a(o({},t),{width:this.width,height:this.height,borderRadius:this.borderRadius}),this.style),n}static \u0275fac=(()=>{let t;return function(i){return(t||(t=s(e)))(i||e)}})();static \u0275cmp=c({type:e,selectors:[["p-skeleton"]],inputs:{styleClass:"styleClass",style:"style",shape:"shape",animation:"animation",borderRadius:"borderRadius",size:"size",width:"width",height:"height"},features:[f([C]),d],decls:1,vars:7,consts:[[3,"ngClass","ngStyle"]],template:function(n,i){n&1&&h(0,"div",0),n&2&&(u(i.styleClass),p("ngClass",i.containerClass())("ngStyle",i.containerStyle),m("data-pc-name","skeleton")("aria-hidden",!0)("data-pc-section","root"))},dependencies:[k,y,g,b],encapsulation:2,changeDetection:0})}return e})();export{A as a};
