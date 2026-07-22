import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

/**
 * Mutation de seed para limpar e popular o banco com dados fictícios.
 * Pode ser chamado por qualquer usuário logado. O criador se torna admin.
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Você precisa estar logado para executar o seed.");

    const userId = currentUser._id;

    // =========================================================
    // 1. LIMPAR TODOS OS DADOS EXISTENTES
    // =========================================================

    // Mensagens
    const allMessages = await ctx.db.query("ticketMessages").collect();
    for (const msg of allMessages) {
      await ctx.db.delete(msg._id);
    }

    // Tickets
    const allTickets = await ctx.db.query("tickets").collect();
    for (const t of allTickets) {
      await ctx.db.delete(t._id);
    }

    // Categorias
    const allCategories = await ctx.db.query("ticketCategories").collect();
    for (const c of allCategories) {
      await ctx.db.delete(c._id);
    }

    // Serviços
    const allServices = await ctx.db.query("services").collect();
    for (const s of allServices) {
      await ctx.db.delete(s._id);
    }

    // Departamentos
    const allDepartments = await ctx.db.query("departments").collect();
    for (const d of allDepartments) {
      await ctx.db.delete(d._id);
    }

    // =========================================================
    // 2. CRIAR ADMIN
    // =========================================================

    // Define o usuário atual como admin
    await ctx.db.patch(userId, {
      name: "Admin Principal",
      role: "admin",
      email: "umcgeo@gmail.com",
    });

    // =========================================================
    // 3. CRIAR DEPARTAMENTOS
    // =========================================================

    const deptSuporte = await ctx.db.insert("departments", {
      name: "Suporte Técnico",
      description: "Suporte para questões técnicas e de infraestrutura",
      color: "#3b82f6",
      order: 1,
    });

    const deptFinanceiro = await ctx.db.insert("departments", {
      name: "Financeiro",
      description: "Questões financeiras, cobranças e pagamentos",
      color: "#22c55e",
      order: 2,
    });

    const deptComercial = await ctx.db.insert("departments", {
      name: "Comercial",
      description: "Vendas, contratos e relacionamento com clientes",
      color: "#f97316",
      order: 3,
    });

    const deptRH = await ctx.db.insert("departments", {
      name: "Recursos Humanos",
      description: "Assuntos relacionados a pessoal e benefícios",
      color: "#a855f7",
      order: 4,
    });

    // =========================================================
    // 4. CRIAR SERVIÇOS
    // =========================================================

    // Suporte Técnico
    const servSoftware = await ctx.db.insert("services", {
      name: "Suporte a Software",
      description: "Problemas com sistemas e aplicações",
      departmentId: deptSuporte,
      color: "#3b82f6",
      sla_hours: 4,
    });

    const servHardware = await ctx.db.insert("services", {
      name: "Suporte a Hardware",
      description: "Problemas com equipamentos físicos",
      departmentId: deptSuporte,
      color: "#6366f1",
      sla_hours: 8,
    });

    const servRede = await ctx.db.insert("services", {
      name: "Redes e Conectividade",
      description: "Problemas de rede, internet e VPN",
      departmentId: deptSuporte,
      color: "#06b6d4",
      sla_hours: 2,
    });

    // Financeiro
    const servCobranca = await ctx.db.insert("services", {
      name: "Cobrança",
      description: "Problemas com boletos e faturas",
      departmentId: deptFinanceiro,
      color: "#22c55e",
      sla_hours: 24,
    });

    const servReembolso = await ctx.db.insert("services", {
      name: "Reembolso",
      description: "Solicitações de reembolso e estorno",
      departmentId: deptFinanceiro,
      color: "#14b8a6",
      sla_hours: 48,
    });

    // Comercial
    const servContrato = await ctx.db.insert("services", {
      name: "Contratos",
      description: "Novos contratos e renovações",
      departmentId: deptComercial,
      color: "#f97316",
      sla_hours: 24,
    });

    const servProposta = await ctx.db.insert("services", {
      name: "Propostas",
      description: "Solicitações de proposta comercial",
      departmentId: deptComercial,
      color: "#eab308",
      sla_hours: 12,
    });

    // RH
    const servBeneficio = await ctx.db.insert("services", {
      name: "Benefícios",
      description: "Vale-transporte, vale-refeição, plano de saúde",
      departmentId: deptRH,
      color: "#a855f7",
      sla_hours: 24,
    });

    const servFolha = await ctx.db.insert("services", {
      name: "Folha de Pagamento",
      description: "Problemas com holerite e pagamentos",
      departmentId: deptRH,
      color: "#ec4899",
      sla_hours: 8,
    });

    // =========================================================
    // 5. CRIAR CATEGORIAS
    // =========================================================

    const catBug = await ctx.db.insert("ticketCategories", {
      name: "Bug",
      description: "Erro ou mau funcionamento de sistema",
      color: "#ef4444",
      order: 1,
    });

    const catMelhoria = await ctx.db.insert("ticketCategories", {
      name: "Melhoria",
      description: "Solicitação de nova funcionalidade",
      color: "#22c55e",
      order: 2,
    });

    const catDuvida = await ctx.db.insert("ticketCategories", {
      name: "Dúvida",
      description: "Tirar dúvidas sobre o sistema",
      color: "#3b82f6",
      order: 3,
    });

    const catUrgente = await ctx.db.insert("ticketCategories", {
      name: "Urgente",
      description: "Problema crítico que impede o trabalho",
      color: "#dc2626",
      order: 4,
    });

    // =========================================================
    // 6. CRIAR USUÁRIOS FICTÍCIOS
    // =========================================================

    // Nota: Como não podemos criar authAccounts manualmente,
    // criamos apenas os perfis dos usuários. Eles serão vinculados
    // quando fizerem login pela primeira vez.
    
    // Para efeito de seed, vamos associar tickets ao admin já existente.

    // =========================================================
    // 7. CRIAR TICKETS FICTÍCIOS
    // =========================================================

    const now = Date.now();
    const day = 86400000; // 1 dia em ms

    const ticketsData = [
      {
        title: "Sistema lento no módulo de vendas",
        description: "O módulo de vendas está extremamente lento desde a última atualização. As consultas demoram mais de 30 segundos para responder, impactando a produtividade da equipe.",
        status: "em_andamento" as const,
        priority: "alta" as const,
        categoryId: catBug,
        departmentId: deptSuporte,
        serviceId: servSoftware,
        daysAgo: 0,
      },
      {
        title: "Nota fiscal não está sendo emitida",
        description: "Ao tentar emitir nota fiscal pelo sistema, retorna o erro: 'Falha na comunicação com a SEFAZ'. Já tentamos em 3 máquinas diferentes.",
        status: "aberto" as const,
        priority: "urgente" as const,
        categoryId: catBug,
        departmentId: deptSuporte,
        serviceId: servSoftware,
        daysAgo: 0,
      },
      {
        title: "Solicitação de novo relatório financeiro",
        description: "Precisamos de um relatório mensal de despesas por centro de custo, com filtro por data e departamento. Pode ser incluído no próximo sprint?",
        status: "aguardando_cliente" as const,
        priority: "media" as const,
        categoryId: catMelhoria,
        departmentId: deptFinanceiro,
        serviceId: servCobranca,
        daysAgo: 1,
      },
      {
        title: "Dúvida sobre lançamento de horas extras",
        description: "Não estou conseguindo lançar horas extras no sistema. Na tela de lançamento o campo 'tipo de hora' não aparece. É algum problema de permissão?",
        status: "resolvido" as const,
        priority: "baixa" as const,
        categoryId: catDuvida,
        departmentId: deptRH,
        serviceId: servFolha,
        daysAgo: 3,
      },
      {
        title: "Acesso à VPN não funciona",
        description: "Desde sexta-feira não consigo conectar na VPN corporativa. Já reinstalei o cliente e reiniciei o roteador, mas o erro persiste: 'Connection timeout'.",
        status: "em_andamento" as const,
        priority: "alta" as const,
        categoryId: catBug,
        departmentId: deptSuporte,
        serviceId: servRede,
        daysAgo: 2,
      },
      {
        title: "Reembolso de passagem aérea",
        description: "Solicito o reembolso da passagem aérea comprada para a viagem de São Paulo que foi cancelada. Segue anexo o comprovante e o cancelamento.",
        status: "aberto" as const,
        priority: "media" as const,
        categoryId: catDuvida,
        departmentId: deptFinanceiro,
        serviceId: servReembolso,
        daysAgo: 1,
      },
      {
        title: "Proposta comercial para novo cliente",
        description: "Preciso de uma proposta comercial para o cliente XYZ Ltda. O escopo inclui: licenciamento de 50 usuários, suporte premium e implantação. Valor estimado: R$ 150.000/ano.",
        status: "fechado" as const,
        priority: "media" as const,
        categoryId: catMelhoria,
        departmentId: deptComercial,
        serviceId: servProposta,
        daysAgo: 5,
      },
      {
        title: "Erro 500 ao acessar painel administrativo",
        description: "Ao tentar acessar o painel administrativo, recebo erro 500. O erro ocorre especificamente na página de relatórios. Outras páginas funcionam normalmente.",
        status: "aberto" as const,
        priority: "urgente" as const,
        categoryId: catUrgente,
        departmentId: deptSuporte,
        serviceId: servSoftware,
        daysAgo: 0,
      },
    ];

    const createdTickets = [];
    for (let i = 0; i < ticketsData.length; i++) {
      const t = ticketsData[i];
      const createdAt = now - t.daysAgo * day;

      // Ticket
      const ticketId = await ctx.db.insert("tickets", {
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        categoryId: t.categoryId,
        departmentId: t.departmentId,
        serviceId: t.serviceId,
        createdBy: userId,
        assignedTo: userId,
        ...(t.status === "resolvido" || t.status === "fechado" ? {
          resolvedAt: createdAt + 3600000,
          resolvedBy: userId,
        } : {}),
        ...(t.status === "fechado" ? {
          closedAt: createdAt + 7200000,
        } : {}),
      });

      // Mensagem inicial
      await ctx.db.insert("ticketMessages", {
        ticketId,
        content: `Chamado #${ticketId.slice(0, 8)} aberto: ${t.title}`,
        senderName: "Sistema",
        isFromAgent: false,
        isFromWhatsApp: false,
      });

      // Mensagem de status (se não estiver aberto)
      if (t.status !== "aberto") {
        const statusLabels: Record<string, string> = {
          em_andamento: "Em Andamento",
          aguardando_cliente: "Aguardando Cliente",
          resolvido: "Resolvido",
          fechado: "Fechado",
        };
        await ctx.db.insert("ticketMessages", {
          ticketId,
          content: `Status alterado para "${statusLabels[t.status]}" por Admin Principal`,
          senderName: "Sistema",
          isFromAgent: true,
          isFromWhatsApp: false,
        });
      }

      // Mensagens extras nos primeiros 4 tickets
      if (i < 4) {
        const agentMsgs = [
          "Olá! Recebemos seu chamado e já estamos analisando. Em breve retornamos com mais informações.",
          "Conseguimos identificar a causa do problema. Nossa equipe já está trabalhando na correção.",
        ];
        for (const msg of agentMsgs) {
          await ctx.db.insert("ticketMessages", {
            ticketId,
            content: msg,
            senderId: userId,
            senderName: "Admin Principal",
            isFromAgent: true,
            isFromWhatsApp: false,
          });
        }
      }

      createdTickets.push(ticketId);
    }

    return {
      success: true,
      message: "Banco de dados populado com sucesso!",
      stats: {
        departments: 4,
        services: 9,
        categories: 4,
        tickets: createdTickets.length,
        adminEmail: "umcgeo@gmail.com",
      },
    };
  },
});
