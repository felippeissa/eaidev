import { Usuario } from './models';

/** Os mesmos usuários de demonstração do app em React, para os dois logarem igual. */
export const USUARIOS: Usuario[] = [
  { id: 'usr-001', login: 'ana.ribeiro', nome: 'Ana Ribeiro', email: 'ana.ribeiro@go.gov.br', times: ['Portal do Servidor 3.0'], perfil: 'Gestor', status: 'Ativo' },
  { id: 'usr-002', login: 'carlos.menezes', nome: 'Carlos Menezes', email: 'carlos.menezes@go.gov.br', times: ['Integração Expresso Pagamentos', 'Data Lake Estadual'], perfil: 'Administrador', status: 'Ativo' },
  { id: 'usr-003', login: 'juliana.prado', nome: 'Juliana Prado', email: 'juliana.prado@go.gov.br', times: ['Data Lake Estadual'], perfil: 'Gestor', status: 'Ativo' },
  { id: 'usr-004', login: 'rafael.duarte', nome: 'Rafael Duarte', email: 'rafael.duarte@go.gov.br', times: ['Observabilidade Corporativa', 'Data Lake Estadual'], perfil: 'Desenvolvedor', status: 'Ativo' },
  { id: 'usr-005', login: 'marina.costa', nome: 'Marina Costa', email: 'marina.costa@go.gov.br', times: ['Modernização Folha'], perfil: 'Gestor', status: 'Inativo' },
  { id: 'usr-006', login: 'beatriz.lima', nome: 'Beatriz Lima', email: 'beatriz.lima@go.gov.br', times: ['App Cidadão Goiás'], perfil: 'Desenvolvedor', status: 'Ativo' },
  { id: 'usr-007', login: 'diego.fontes', nome: 'Diego Fontes', email: 'diego.fontes@go.gov.br', times: ['Portal do Servidor 3.0'], perfil: 'Leitor', status: 'Ativo' },
  { id: 'usr-008', login: 'paulo.andrade', nome: 'Paulo Andrade', email: 'paulo.andrade@go.gov.br', times: ['Integração Expresso Pagamentos'], perfil: 'Desenvolvedor', status: 'Ativo' },
  { id: 'usr-009', login: 'camila.rocha', nome: 'Camila Rocha', email: 'camila.rocha@go.gov.br', times: ['Portal do Servidor 3.0', 'App Cidadão Goiás'], perfil: 'Desenvolvedor', status: 'Ativo' },
  { id: 'usr-010', login: 'tiago.nunes', nome: 'Tiago Nunes', email: 'tiago.nunes@go.gov.br', times: ['Observabilidade Corporativa'], perfil: 'Desenvolvedor', status: 'Ativo' },
  { id: 'usr-011', login: 'larissa.moreira', nome: 'Larissa Moreira', email: 'larissa.moreira@go.gov.br', times: ['Modernização Folha', 'Portal do Servidor 3.0'], perfil: 'Gestor', status: 'Ativo' },
  { id: 'usr-012', login: 'eduardo.vasques', nome: 'Eduardo Vasques', email: 'eduardo.vasques@go.gov.br', times: ['Data Lake Estadual', 'Observabilidade Corporativa'], perfil: 'Administrador', status: 'Ativo' },
  { id: 'usr-013', login: 'patricia.gomes', nome: 'Patrícia Gomes', email: 'patricia.gomes@go.gov.br', times: ['App Cidadão Goiás'], perfil: 'Leitor', status: 'Ativo' },
];
