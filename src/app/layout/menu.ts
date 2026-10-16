import { MenuItem } from 'primeng/api';

/** A v2 tem só Painel e Produtos. */
export function montarMenu(url: string): MenuItem[] {
  const itens = base(url);
  // Entre irmãos vence o caminho mais longo que casa: "/projetos" e "/projetos/docs" casam os dois em Documentações.
  const folhas = itens.flatMap((item) => item.items ?? [item]);
  const casa = (link: string) => (link === '/' ? url === '/' : url === link || url.startsWith(`${link}/`));
  const melhor = folhas
    .filter((folha) => typeof folha.routerLink === 'string' && casa(folha.routerLink))
    .sort((a, b) => String(b.routerLink).length - String(a.routerLink).length)[0];
  for (const folha of folhas) if (folha === melhor) folha.styleClass = 'item-ativo';
  return itens;
}

function base(url: string): MenuItem[] {
  return [
    { label: 'Painel', icon: 'pi pi-th-large', routerLink: '/', routerLinkActiveOptions: { exact: true } },
    {
      label: 'Produtos',
      icon: 'pi pi-box',
      expanded: url === '/projetos' || url.startsWith('/projetos/'),
      items: [{ label: 'Listagem', icon: 'pi pi-list', routerLink: '/projetos', routerLinkActiveOptions: { exact: true } },
        { label: 'Especificações', icon: 'pi pi-file', routerLink: '/projetos/especificacoes' },
        { label: 'Documentações', icon: 'pi pi-book', routerLink: '/projetos/docs' },
      ],
    },
    { label: 'Usuários', icon: 'pi pi-users', routerLink: '/usuarios' },
  ];
}
