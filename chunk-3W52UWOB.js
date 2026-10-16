import{Aa as P,Da as A,Fa as H,c as $,e as j,f as q,g as R,h as w,ha as O,xa as N,ya as B,za as z}from"./chunk-IXKC2M47.js";import{Db as _,Eb as k,Fb as h,Gb as c,Ib as p,Jb as d,N as Q,Na as i,Nb as v,Ob as C,T as S,Wb as D,Za as I,bb as x,ca as g,db as l,jb as E,kb as r,oa as F,ob as M,ub as m,vb as u,xb as T,yb as b,zb as y}from"./chunk-4CMEKOL3.js";var G=["header"],J=["title"],K=["subtitle"],L=["content"],U=["footer"],W=["*",[["p-header"]],[["p-footer"]]],X=["*","p-header","p-footer"];function Y(e,o){e&1&&y(0)}function Z(e,o){if(e&1&&(m(0,"div",8),h(1,1),l(2,Y,1,0,"ng-container",6),u()),e&2){let t=_();i(2),r("ngTemplateOutlet",t.headerTemplate||t._headerTemplate)}}function ee(e,o){if(e&1&&(T(0),v(1),b()),e&2){let t=_(2);i(),C(t.header)}}function te(e,o){e&1&&y(0)}function ne(e,o){if(e&1&&(m(0,"div",9),l(1,ee,2,1,"ng-container",10)(2,te,1,0,"ng-container",6),u()),e&2){let t=_();i(),r("ngIf",t.header&&!t._titleTemplate&&!t.titleTemplate),i(),r("ngTemplateOutlet",t.titleTemplate||t._titleTemplate)}}function ae(e,o){if(e&1&&(T(0),v(1),b()),e&2){let t=_(2);i(),C(t.subheader)}}function ie(e,o){e&1&&y(0)}function re(e,o){if(e&1&&(m(0,"div",11),l(1,ae,2,1,"ng-container",10)(2,ie,1,0,"ng-container",6),u()),e&2){let t=_();i(),r("ngIf",t.subheader&&!t._subtitleTemplate&&!t.subtitleTemplate),i(),r("ngTemplateOutlet",t.subtitleTemplate||t._subtitleTemplate)}}function oe(e,o){e&1&&y(0)}function le(e,o){e&1&&y(0)}function ce(e,o){if(e&1&&(m(0,"div",12),h(1,2),l(2,le,1,0,"ng-container",6),u()),e&2){let t=_();i(2),r("ngTemplateOutlet",t.footerTemplate||t._footerTemplate)}}var pe=({dt:e})=>`
.p-card {
    background: ${e("card.background")};
    color: ${e("card.color")};
    box-shadow: ${e("card.shadow")};
    border-radius: ${e("card.border.radius")};
    display: flex;
    flex-direction: column;
}

.p-card-caption {
    display: flex;
    flex-direction: column;
    gap: ${e("card.caption.gap")};
}

.p-card-body {
    padding: ${e("card.body.padding")};
    display: flex;
    flex-direction: column;
    gap: ${e("card.body.gap")};
}

.p-card-title {
    font-size: ${e("card.title.font.size")};
    font-weight: ${e("card.title.font.weight")};
}

.p-card-subtitle {
    color: ${e("card.subtitle.color")};
}
`,de={root:"p-card p-component",header:"p-card-header",body:"p-card-body",caption:"p-card-caption",title:"p-card-title",subtitle:"p-card-subtitle",content:"p-card-content",footer:"p-card-footer"},V=(()=>{class e extends A{name="card";theme=pe;classes=de;static \u0275fac=(()=>{let t;return function(n){return(t||(t=g(e)))(n||e)}})();static \u0275prov=Q({token:e,factory:e.\u0275fac})}return e})();var Me=(()=>{class e extends H{header;subheader;set style(t){O(this._style(),t)||this._style.set(t)}styleClass;headerFacet;footerFacet;headerTemplate;titleTemplate;subtitleTemplate;contentTemplate;footerTemplate;_headerTemplate;_titleTemplate;_subtitleTemplate;_contentTemplate;_footerTemplate;_style=F(null);_componentStyle=S(V);getBlockableElement(){return this.el.nativeElement.children[0]}templates;ngAfterContentInit(){this.templates.forEach(t=>{switch(t.getType()){case"header":this._headerTemplate=t.template;break;case"title":this._titleTemplate=t.template;break;case"subtitle":this._subtitleTemplate=t.template;break;case"content":this._contentTemplate=t.template;break;case"footer":this._footerTemplate=t.template;break;default:this._contentTemplate=t.template;break}})}static \u0275fac=(()=>{let t;return function(n){return(t||(t=g(e)))(n||e)}})();static \u0275cmp=I({type:e,selectors:[["p-card"]],contentQueries:function(f,n,s){if(f&1&&(c(s,N,5),c(s,B,5),c(s,G,4),c(s,J,4),c(s,K,4),c(s,L,4),c(s,U,4),c(s,z,4)),f&2){let a;p(a=d())&&(n.headerFacet=a.first),p(a=d())&&(n.footerFacet=a.first),p(a=d())&&(n.headerTemplate=a.first),p(a=d())&&(n.titleTemplate=a.first),p(a=d())&&(n.subtitleTemplate=a.first),p(a=d())&&(n.contentTemplate=a.first),p(a=d())&&(n.footerTemplate=a.first),p(a=d())&&(n.templates=a)}},inputs:{header:"header",subheader:"subheader",style:"style",styleClass:"styleClass"},features:[D([V]),x],ngContentSelectors:X,decls:9,vars:10,consts:[[3,"ngClass","ngStyle"],["class","p-card-header",4,"ngIf"],[1,"p-card-body"],["class","p-card-title",4,"ngIf"],["class","p-card-subtitle",4,"ngIf"],[1,"p-card-content"],[4,"ngTemplateOutlet"],["class","p-card-footer",4,"ngIf"],[1,"p-card-header"],[1,"p-card-title"],[4,"ngIf"],[1,"p-card-subtitle"],[1,"p-card-footer"]],template:function(f,n){f&1&&(k(W),m(0,"div",0),l(1,Z,3,1,"div",1),m(2,"div",2),l(3,ne,3,2,"div",3)(4,re,3,2,"div",4),m(5,"div",5),h(6),l(7,oe,1,0,"ng-container",6),u(),l(8,ce,3,1,"div",7),u()()),f&2&&(M(n.styleClass),r("ngClass","p-card p-component")("ngStyle",n._style()),E("data-pc-name","card"),i(),r("ngIf",n.headerFacet||n.headerTemplate||n._headerTemplate),i(2),r("ngIf",n.header||n.titleTemplate||n._titleTemplate),i(),r("ngIf",n.subheader||n.subtitleTemplate||n._subtitleTemplate),i(3),r("ngTemplateOutlet",n.contentTemplate||n._contentTemplate),i(),r("ngIf",n.footerFacet||n.footerTemplate||n._footerTemplate))},dependencies:[w,$,j,R,q,P],encapsulation:2,changeDetection:0})}return e})();export{Me as a};
