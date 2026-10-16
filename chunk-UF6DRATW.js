import{a as me}from"./chunk-WQWC6ODZ.js";import{c as ne,d as D,f as E,h as L,i as O,k as M}from"./chunk-OFLOCURC.js";import{Aa as de,Da as ce,Fa as pe,G as ae,Pa as he,Ta as x,c as Y,ca as se,e as ee,g as te,h as ie,v as Q,w as oe,y as re,za as le}from"./chunk-IXKC2M47.js";import{$ as y,Ab as S,Cb as I,Db as s,Eb as $,Fb as P,Gb as w,Hb as k,Ib as p,Jb as m,N as V,Na as d,Nb as N,Ob as H,T as A,Wb as G,Yb as K,Za as B,Zb as U,_ as b,bb as R,bc as J,ca as C,db as c,hc as W,ia as v,jb as f,kb as a,nb as z,ob as T,oc as h,pb as F,pc as X,ub as u,vb as _,wb as Z,xb as j,yb as q,zb as g}from"./chunk-4CMEKOL3.js";var ue=["header"],_e=["footer"],we=["content"],be=["closeicon"],ye=["headless"],ge=["maskRef"],xe=["container"],ve=["closeButton"],ke=["*"],Ce=(t,r,e,o,i,n)=>({"p-drawer":!0,"p-drawer-active":t,"p-drawer-left":r,"p-drawer-right":e,"p-drawer-top":o,"p-drawer-bottom":i,"p-drawer-full":n}),Te=(t,r)=>({transform:t,transition:r}),Se=t=>({value:"visible",params:t});function Ie(t,r){t&1&&g(0)}function De(t,r){if(t&1&&c(0,Ie,1,0,"ng-container",4),t&2){let e=s(2);a("ngTemplateOutlet",e.headlessTemplate||e._headlessTemplate)}}function Ee(t,r){t&1&&g(0)}function Le(t,r){if(t&1&&(u(0,"div"),N(1),_()),t&2){let e=s(3);T(e.cx("title")),d(),H(e.header)}}function Oe(t,r){t&1&&Z(0,"TimesIcon"),t&2&&f("data-pc-section","closeicon")}function Me(t,r){}function Qe(t,r){t&1&&c(0,Me,0,0,"ng-template")}function Ve(t,r){if(t&1&&c(0,Oe,1,1,"TimesIcon",8)(1,Qe,1,0,null,4),t&2){let e=s(4);a("ngIf",!e.closeIconTemplate&&!e._closeIconTemplate),d(),a("ngTemplateOutlet",e.closeIconTemplate||e._closeIconTemplate)}}function Ae(t,r){if(t&1){let e=S();u(0,"p-button",9),I("onClick",function(i){b(e);let n=s(3);return y(n.close(i))})("keydown.enter",function(i){b(e);let n=s(3);return y(n.close(i))}),c(1,Ve,2,2,"ng-template",null,1,W),_()}if(t&2){let e=s(3);a("ngClass",e.cx("closeButton"))("buttonProps",e.closeButtonProps)("ariaLabel",e.ariaCloseLabel),f("data-pc-section","closebutton")("data-pc-group-section","iconcontainer")}}function Be(t,r){t&1&&g(0)}function Re(t,r){t&1&&g(0)}function ze(t,r){if(t&1&&(j(0),u(1,"div",5),c(2,Re,1,0,"ng-container",4),_(),q()),t&2){let e=s(3);d(),a("ngClass",e.cx("footer")),f("data-pc-section","footer"),d(),a("ngTemplateOutlet",e.footerTemplate||e._footerTemplate)}}function Fe(t,r){if(t&1&&(u(0,"div",5),c(1,Ee,1,0,"ng-container",4)(2,Le,2,3,"div",6)(3,Ae,3,5,"p-button",7),_(),u(4,"div",5),P(5),c(6,Be,1,0,"ng-container",4),_(),c(7,ze,3,3,"ng-container",8)),t&2){let e=s(2);a("ngClass",e.cx("header")),f("data-pc-section","header"),d(),a("ngTemplateOutlet",e.headerTemplate||e._headerTemplate),d(),a("ngIf",e.header),d(),a("ngIf",e.showCloseIcon&&e.closable),d(),a("ngClass",e.cx("content")),f("data-pc-section","content"),d(2),a("ngTemplateOutlet",e.contentTemplate||e._contentTemplate),d(),a("ngIf",e.footerTemplate||e._footerTemplate)}}function Ze(t,r){if(t&1){let e=S();u(0,"div",3,0),I("@panelState.start",function(i){b(e);let n=s();return y(n.onAnimationStart(i))})("@panelState.done",function(i){b(e);let n=s();return y(n.onAnimationEnd(i))})("keydown",function(i){b(e);let n=s();return y(n.onKeyDown(i))}),c(2,De,1,1,"ng-container")(3,Fe,8,9),_()}if(t&2){let e=s();z(e.style),T(e.styleClass),a("ngClass",J(9,Ce,e.visible,e.position==="left"&&!e.fullScreen,e.position==="right"&&!e.fullScreen,e.position==="top"&&!e.fullScreen,e.position==="bottom"&&!e.fullScreen,e.fullScreen||e.position==="full"))("@panelState",K(19,Se,U(16,Te,e.transformOptions,e.transitionOptions))),f("data-pc-name","sidebar")("data-pc-section","root"),d(2),F(e.headlessTemplate||e._headlessTemplate?2:3)}}var je=({dt:t})=>`
.p-drawer {
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    transform: translate3d(0px, 0px, 0px);
    position: fixed;
    transition: transform 0.3s;
    background: ${t("drawer.background")};
    color: ${t("drawer.color")};
    border: 1px solid ${t("drawer.border.color")};
    box-shadow: ${t("drawer.shadow")};
}

.p-drawer-content {
    overflow-y: auto;
    flex-grow: 1;
    padding: ${t("drawer.content.padding")};
}

.p-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding: ${t("drawer.header.padding")};
}

.p-drawer-footer {
    padding: ${t("drawer.header.padding")};
}

.p-drawer-title {
    font-weight: ${t("drawer.title.font.weight")};
    font-size: ${t("drawer.title.font.size")};
}

.p-drawer-full .p-drawer {
    transition: none;
    transform: none;
    width: 100vw !important;
    height: 100vh !important;
    max-height: 100%;
    top: 0px !important;
    left: 0px !important;
    border-width: 1px;
}

.p-drawer-left .p-drawer {
    align-self: start;
    width: 20rem;
    height: 100%;
    border-right-width: 1px;
}

.p-drawer-right .p-drawer {
    align-self: end;
    width: 20rem;
    height: 100%;
    border-left-width: 1px;
}

.p-drawer-top .p-drawer {
    height: 10rem;
    width: 100%;
    border-bottom-width: 1px;
}

.p-drawer-bottom .p-drawer {
    height: 10rem;
    width: 100%;
    border-top-width: 1px;
}

.p-drawer-left .p-drawer-content,
.p-drawer-right .p-drawer-content,
.p-drawer-top .p-drawer-content,
.p-drawer-bottom .p-drawer-content {
    width: 100%;
    height: 100%;
}

.p-drawer-open {
    display: flex;
}

.p-drawer-top {
    justify-content: flex-start;
}

.p-drawer-bottom {
    justify-content: flex-end;
}

.p-drawer {
    position: fixed;
    transition: transform 0.3s;
    display: flex;
    flex-direction: column;
}

.p-drawer-content {
    position: relative;
    overflow-y: auto;
    flex-grow: 1;
}

.p-drawer-header {
    display: flex;
    align-items: center;
}

.p-drawer-footer {
    margin-top: auto;
}

.p-drawer-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
}

.p-drawer-left {
    top: 0;
    left: 0;
    width: 20rem;
    height: 100%;
}

.p-drawer-right {
    top: 0;
    right: 0;
    width: 20rem;
    height: 100%;
}

.p-drawer-top {
    top: 0;
    left: 0;
    width: 100%;
    height: 10rem;
}

.p-drawer-bottom {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 10rem;
}

.p-drawer-full {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    -webkit-transition: none;
    transition: none;
}

.p-drawer-mask {
    background-color: rgba(0, 0, 0, 0.4);
    transition-duration: 0.2s;
}

.p-overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-overlay-mask:dir(rtl) {
    flex-direction: row-reverse;
}

.p-overlay-mask-enter {
    animation: p-overlay-mask-enter-animation 150ms forwards;
}

.p-overlay-mask-leave {
    animation: p-overlay-mask-leave-animation 150ms forwards;
}

@keyframes p-overlay-mask-enter-animation {
    from {
        background-color: transparent;
    }
    to {
        background-color: rgba(0, 0, 0, 0.4);
    }
}
@keyframes p-overlay-mask-leave-animation {
    from {
        background-color: rgba(0, 0, 0, 0.4);
    }
    to {
        background-color: transparent;
    }
}
`,qe={mask:({instance:t})=>({position:"fixed",height:"100%",width:"100%",left:0,top:0,display:"flex",flexDirection:"column",alignItems:t.position==="top"?"flex-start":t.position==="bottom"?"flex-end":"center"})},$e={mask:({instance:t})=>({"p-drawer-mask":!0,"p-overlay-mask p-overlay-mask-enter":t.modal,"p-drawer-open":t.containerVisible,"p-drawer-full":t.fullScreen,[`p-drawer-${t.position}`]:!!t.position}),root:({instance:t})=>({"p-drawer p-component":!0,"p-drawer-full":t.fullScreen}),header:"p-drawer-header",title:"p-drawer-title",pcCloseButton:"p-drawer-close-button",content:"p-drawer-content",footer:"p-drawer-footer"},fe=(()=>{class t extends ce{name="drawer";theme=je;classes=$e;inlineStyles=qe;static \u0275fac=(()=>{let e;return function(i){return(e||(e=C(t)))(i||t)}})();static \u0275prov=V({token:t,factory:t.\u0275fac})}return t})();var Pe=O([E({transform:"{{transform}}",opacity:0}),D("{{transition}}")]),Ne=O([D("{{transition}}",E({transform:"{{transform}}",opacity:0}))]),_t=(()=>{class t extends pe{appendTo="body";blockScroll=!1;style;styleClass;ariaCloseLabel;autoZIndex=!0;baseZIndex=0;modal=!0;closeButtonProps={severity:"secondary",text:!0,rounded:!0};dismissible=!0;showCloseIcon=!0;closeOnEscape=!0;transitionOptions="150ms cubic-bezier(0, 0, 0.2, 1)";get visible(){return this._visible}set visible(e){this._visible=e}get position(){return this._position}set position(e){if(this._position=e,e==="full"){this.transformOptions="none";return}switch(e){case"left":this.transformOptions="translate3d(-100%, 0px, 0px)";break;case"right":this.transformOptions="translate3d(100%, 0px, 0px)";break;case"bottom":this.transformOptions="translate3d(0px, 100%, 0px)";break;case"top":this.transformOptions="translate3d(0px, -100%, 0px)";break}}get fullScreen(){return this._fullScreen}set fullScreen(e){this._fullScreen=e,e&&(this.transformOptions="none")}header;maskStyle;closable=!0;onShow=new v;onHide=new v;visibleChange=new v;maskRef;containerViewChild;closeButtonViewChild;initialized;_visible;_position="left";_fullScreen=!1;container;transformOptions="translate3d(-100%, 0px, 0px)";mask;maskClickListener;documentEscapeListener;animationEndListener;_componentStyle=A(fe);ngAfterViewInit(){super.ngAfterViewInit(),this.initialized=!0}headerTemplate;footerTemplate;contentTemplate;closeIconTemplate;headlessTemplate;_headerTemplate;_footerTemplate;_contentTemplate;_closeIconTemplate;_headlessTemplate;templates;ngAfterContentInit(){this.templates?.forEach(e=>{switch(e.getType()){case"content":this._contentTemplate=e.template;break;case"header":this._headerTemplate=e.template;break;case"footer":this._footerTemplate=e.template;break;case"closeicon":this._closeIconTemplate=e.template;break;case"headless":this._headlessTemplate=e.template;break;default:this._contentTemplate=e.template;break}})}onKeyDown(e){e.code==="Escape"&&this.hide(!1)}show(){this.container.setAttribute(this.attrSelector,""),this.autoZIndex&&x.set("modal",this.container,this.baseZIndex||this.config.zIndex.modal),this.modal&&this.enableModality(),this.onShow.emit({}),this.visibleChange.emit(!0)}hide(e=!0){e&&this.onHide.emit({}),this.modal&&this.disableModality()}close(e){this.hide(),this.visibleChange.emit(!1),e.preventDefault()}enableModality(){let e=this.document.querySelectorAll(".p-drawer-active"),o=e.length,i=o==1?String(parseInt(this.container.style.zIndex)-1):String(parseInt(e[o-1].style.zIndex)-1);this.mask||(this.mask=this.renderer.createElement("div"),this.renderer.setStyle(this.mask,"zIndex",i),se(this.mask,"style",this.maskStyle),Q(this.mask,"p-overlay-mask p-drawer-mask p-overlay-mask-enter"),this.dismissible&&(this.maskClickListener=this.renderer.listen(this.mask,"click",n=>{this.dismissible&&this.close(n)})),this.renderer.appendChild(this.document.body,this.mask),this.blockScroll&&oe())}disableModality(){this.mask&&(Q(this.mask,"p-overlay-mask-leave"),this.animationEndListener=this.renderer.listen(this.mask,"animationend",this.destroyModal.bind(this)))}destroyModal(){this.unbindMaskClickListener(),this.mask&&this.renderer.removeChild(this.document.body,this.mask),this.blockScroll&&re(),this.unbindAnimationEndListener(),this.mask=null}onAnimationStart(e){e.toState==="visible"&&(this.container=e.element,this.appendContainer(),this.show(),this.closeOnEscape&&this.bindDocumentEscapeListener())}onAnimationEnd(e){e.toState==="void"&&(this.hide(!1),x.clear(this.container),this.unbindGlobalListeners())}appendContainer(){this.appendTo&&(this.appendTo==="body"?this.renderer.appendChild(this.document.body,this.container):ae(this.appendTo,this.container))}bindDocumentEscapeListener(){let e=this.el?this.el.nativeElement.ownerDocument:this.document;this.documentEscapeListener=this.renderer.listen(e,"keydown",o=>{o.which==27&&parseInt(this.container.style.zIndex)===x.get(this.container)&&this.close(o)})}unbindDocumentEscapeListener(){this.documentEscapeListener&&(this.documentEscapeListener(),this.documentEscapeListener=null)}unbindMaskClickListener(){this.maskClickListener&&(this.maskClickListener(),this.maskClickListener=null)}unbindGlobalListeners(){this.unbindMaskClickListener(),this.unbindDocumentEscapeListener()}unbindAnimationEndListener(){this.animationEndListener&&this.mask&&(this.animationEndListener(),this.animationEndListener=null)}ngOnDestroy(){this.initialized=!1,this.visible&&this.modal&&this.destroyModal(),this.appendTo&&this.container&&this.renderer.appendChild(this.el.nativeElement,this.container),this.container&&this.autoZIndex&&x.clear(this.container),this.container=null,this.unbindGlobalListeners(),this.unbindAnimationEndListener()}static \u0275fac=(()=>{let e;return function(i){return(e||(e=C(t)))(i||t)}})();static \u0275cmp=B({type:t,selectors:[["p-drawer"]],contentQueries:function(o,i,n){if(o&1&&(w(n,ue,4),w(n,_e,4),w(n,we,4),w(n,be,4),w(n,ye,4),w(n,le,4)),o&2){let l;p(l=m())&&(i.headerTemplate=l.first),p(l=m())&&(i.footerTemplate=l.first),p(l=m())&&(i.contentTemplate=l.first),p(l=m())&&(i.closeIconTemplate=l.first),p(l=m())&&(i.headlessTemplate=l.first),p(l=m())&&(i.templates=l)}},viewQuery:function(o,i){if(o&1&&(k(ge,5),k(xe,5),k(ve,5)),o&2){let n;p(n=m())&&(i.maskRef=n.first),p(n=m())&&(i.containerViewChild=n.first),p(n=m())&&(i.closeButtonViewChild=n.first)}},inputs:{appendTo:"appendTo",blockScroll:[2,"blockScroll","blockScroll",h],style:"style",styleClass:"styleClass",ariaCloseLabel:"ariaCloseLabel",autoZIndex:[2,"autoZIndex","autoZIndex",h],baseZIndex:[2,"baseZIndex","baseZIndex",X],modal:[2,"modal","modal",h],closeButtonProps:"closeButtonProps",dismissible:[2,"dismissible","dismissible",h],showCloseIcon:[2,"showCloseIcon","showCloseIcon",h],closeOnEscape:[2,"closeOnEscape","closeOnEscape",h],transitionOptions:"transitionOptions",visible:"visible",position:"position",fullScreen:"fullScreen",header:"header",maskStyle:"maskStyle",closable:[2,"closable","closable",h]},outputs:{onShow:"onShow",onHide:"onHide",visibleChange:"visibleChange"},features:[G([fe]),R],ngContentSelectors:ke,decls:1,vars:1,consts:[["container",""],["icon",""],["role","complementary",3,"ngClass","style","class","keydown",4,"ngIf"],["role","complementary",3,"keydown","ngClass"],[4,"ngTemplateOutlet"],[3,"ngClass"],[3,"class",4,"ngIf"],[3,"ngClass","buttonProps","ariaLabel","onClick","keydown.enter",4,"ngIf"],[4,"ngIf"],[3,"onClick","keydown.enter","ngClass","buttonProps","ariaLabel"]],template:function(o,i){o&1&&($(),c(0,Ze,4,21,"div",2)),o&2&&a("ngIf",i.visible)},dependencies:[ie,Y,ee,te,he,me,de],encapsulation:2,data:{animation:[ne("panelState",[L("void => visible",[M(Pe)]),L("visible => void",[M(Ne)])])]},changeDetection:0})}return t})();export{_t as a};
