import { useCallback } from 'react';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

// Definir as interfaces necessárias
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface Activity {
  id: string;
  description: string;
  type: 'transaction' | 'payment';
  timestamp: string;
}

interface ExportData {
  transactions: Transaction[];
  payments: Payment[];
  activities: Activity[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    totalTransactions: number;
    totalPayments: number;
  };
}

const useDataExport = () => {
  
  // Função para exportar em CSV
  const exportToCSV = useCallback((data: ExportData, filename?: string) => {
    try {
      const exportDateTime = new Date().toLocaleString('pt-BR');
      const csvFilename = filename || `extrato_movimentacoes_${new Date().toISOString().split('T')[0]}.csv`;

      // Criar cabeçalho informativo para Excel
      const headerInfo = [
        ['EXTRATO DE MOVIMENTAÇÕES FINANCEIRAS - SISTEMA DE GESTÃO'],
        [''],
        ['Data de Geração:', exportDateTime],
        ['Total de Transações:', data.transactions.length.toString()],
        ['Total de Pagamentos:', data.payments.length.toString()],
        ['Total de Movimentações:', (data.transactions.length + data.payments.length).toString()],
        [''],
        ['RESUMO FINANCEIRO'],
        ['Categoria', 'Valor (R$)', '', '', '', '', '', '', '', '', ''],
        ['Total de Receitas', data.summary.totalIncome.toString().replace('.', ','), '', '', '', '', '', '', '', '', ''],
        ['Total de Despesas', data.summary.totalExpenses.toString().replace('.', ','), '', '', '', '', '', '', '', '', ''],
        ['Saldo Líquido', data.summary.balance.toString().replace('.', ','), '', '', '', '', '', '', '', '', ''],
        [''],
        ['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
        ['TABELA DE MOVIMENTAÇÕES DETALHADAS'],
        ['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
        ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor Original', 'Débito', 'Crédito', 'Saldo Acumulado', 'Documento', 'Status', 'Vencimento', 'Observações']
      ];

      // Preparar todas as movimentações ordenadas por data
      const allMovements = [
        ...data.transactions.map(transaction => ({
          date: new Date(transaction.date),
          type: 'TRANSAÇÃO',
          category: transaction.category,
          description: transaction.description,
          originalAmount: transaction.amount,
          isCredit: transaction.type === 'income',
          document: transaction.id.slice(-8).toUpperCase(),
          status: transaction.type === 'income' ? 'CONCLUÍDA' : 'CONCLUÍDA',
          dueDate: transaction.date,
          observations: transaction.type === 'income' ? 'Receita registrada' : 'Despesa registrada'
        })),
        ...data.payments.map(payment => ({
          date: new Date(payment.dueDate),
          type: 'PAGAMENTO',
          category: 'Pagamentos',
          description: payment.description,
          originalAmount: payment.amount,
          isCredit: false,
          document: payment.id.slice(-8).toUpperCase(),
          status: payment.status === 'completed' ? 'PAGO' : 
                 payment.status === 'overdue' ? 'VENCIDO' : 'PENDENTE',
          dueDate: payment.dueDate,
          observations: `Pagamento ${payment.status === 'completed' ? 'realizado' : 
                       payment.status === 'overdue' ? 'em atraso' : 'pendente'}`
        }))
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calcular saldo acumulado
      let saldoAcumulado = 0;
      const movementRows = allMovements.map(movement => {
        const valor = movement.isCredit ? movement.originalAmount : -movement.originalAmount;
        saldoAcumulado += valor;

        return [
          movement.date.toLocaleDateString('pt-BR'),
          movement.type,
          movement.category,
          movement.description,
          movement.originalAmount.toString().replace('.', ','),
          movement.isCredit ? '' : movement.originalAmount.toString().replace('.', ','),
          movement.isCredit ? movement.originalAmount.toString().replace('.', ',') : '',
          saldoAcumulado.toString().replace('.', ','),
          movement.document,
          movement.status,
          new Date(movement.dueDate).toLocaleDateString('pt-BR'),
          movement.observations
        ];
      });

      // Linha de fechamento da tabela
      const tableEnd = [
        ['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
        ['']
      ];

      // Calcular posição das fórmulas baseado no número real de linhas
      const dataStartRow = headerInfo.length + 1; // Linha onde começam os dados
      const dataEndRow = dataStartRow + movementRows.length - 1; // Última linha de dados
      const formulaStartRow = dataEndRow + tableEnd.length + 2; // Onde começam as fórmulas

      // Adicionar fórmulas Excel com referências corretas
      const excelFormulas = [
        ['TOTAIS CALCULADOS (Fórmulas Excel)', '', '', '', '', '', '', '', '', '', ''],
        [`Total de Débitos:`, `=SOMA(F${dataStartRow}:F${dataEndRow})`, '', '', '', '', '', '', '', '', ''],
        [`Total de Créditos:`, `=SOMA(G${dataStartRow}:G${dataEndRow})`, '', '', '', '', '', '', '', '', ''],
        [`Saldo Final:`, `=G${formulaStartRow + 1}-F${formulaStartRow + 1}`, '', '', '', '', '', '', '', '', ''],
        [''],
        ['ANÁLISES AUXILIARES', '', '', '', '', '', '', '', '', '', ''],
        [`Maior Débito:`, `=SE(CONT.VALORES(F${dataStartRow}:F${dataEndRow})>0;MÁXIMO(F${dataStartRow}:F${dataEndRow});0)`, '', '', '', '', '', '', '', '', ''],
        [`Maior Crédito:`, `=SE(CONT.VALORES(G${dataStartRow}:G${dataEndRow})>0;MÁXIMO(G${dataStartRow}:G${dataEndRow});0)`, '', '', '', '', '', '', '', '', ''],
        [`Média de Débitos:`, `=SE(CONT.VALORES(F${dataStartRow}:F${dataEndRow})>0;MÉDIA(F${dataStartRow}:F${dataEndRow});0)`, '', '', '', '', '', '', '', '', ''],
        [`Média de Créditos:`, `=SE(CONT.VALORES(G${dataStartRow}:G${dataEndRow})>0;MÉDIA(G${dataStartRow}:G${dataEndRow});0)`, '', '', '', '', '', '', '', '', ''],
        [`Qtd de Débitos:`, `=CONT.VALORES(F${dataStartRow}:F${dataEndRow})`, '', '', '', '', '', '', '', '', ''],
        [`Qtd de Créditos:`, `=CONT.VALORES(G${dataStartRow}:G${dataEndRow})`, '', '', '', '', '', '', '', '', ''],
        [''],
        ['INSTRUÇÕES PARA FORMATAÇÃO AUTOMÁTICA:', '', '', '', '', '', '', '', '', '', ''],
        ['1. Selecione os dados da tabela (incluindo cabeçalhos)', '', '', '', '', '', '', '', '', '', ''],
        ['2. Pressione Ctrl+T ou vá em Inserir > Tabela', '', '', '', '', '', '', '', '', '', ''],
        ['3. Marque "Minha tabela tem cabeçalhos" e clique OK', '', '', '', '', '', '', '', '', '', ''],
        ['4. Escolha um estilo de tabela no menu Design', '', '', '', '', '', '', '', '', '', '']
      ];

      // Combinar todos os dados
      const finalData = [...headerInfo, ...movementRows, ...tableEnd, ...excelFormulas];

      // Configuração especial para Excel com formatação de tabela
      const csv = Papa.unparse(finalData, {
        delimiter: ';', // Padrão brasileiro para Excel
        header: false,  // Não adicionar cabeçalho automático
        quotes: false,  // Sem aspas para melhor formatação
        quoteChar: '"',
        escapeChar: '"',
        skipEmptyLines: false
      });

      // Adicionar BOM (Byte Order Mark) para UTF-8
      const csvWithBOM = '\uFEFF' + csv;

      // Criar e baixar arquivo
      const blob = new Blob([csvWithBOM], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', csvFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL
      URL.revokeObjectURL(url);

      return { success: true, message: 'Arquivo CSV formatado para tabela Excel exportado com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return { success: false, message: 'Erro ao exportar arquivo CSV para Excel' };
    }
  }, []);

  // Função para exportar em PDF
  const exportToPDF = useCallback((data: ExportData, filename?: string) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const exportDate = new Date().toLocaleDateString('pt-BR');
      const exportDateTime = new Date().toLocaleString('pt-BR');
      const periodStart = data.transactions.length > 0 ? 
        new Date(Math.min(...data.transactions.map(t => new Date(t.date).getTime()))).toLocaleDateString('pt-BR') :
        exportDate;
      const periodEnd = exportDate;
      const pdfFilename = filename || `extrato_movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`;

      let yPosition = margin + 10;
      let pageNumber = 1;

      // Função para adicionar cabeçalho em todas as páginas
      const addHeader = () => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EXTRATO DE MOVIMENTAÇÕES BANCÁRIAS', pageWidth / 2, 20, { align: 'center' });
        
        // Linha separadora
        doc.setLineWidth(0.5);
        doc.line(margin, 30, pageWidth - margin, 30);
        
        return 40;
      };

      // Função para adicionar rodapé
      const addFooter = () => {
        const footerY = pageHeight - 20;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${pageNumber}`, pageWidth - margin, footerY, { align: 'right' });
        doc.text(`Documento gerado em ${exportDateTime}`, margin, footerY);
        doc.text('Este documento foi gerado eletronicamente e é válido sem assinatura física.', pageWidth / 2, footerY - 5, { align: 'center' });
      };

      // Adicionar primeiro cabeçalho
      yPosition = addHeader();

      // Informações obrigatórias ABNT
      yPosition += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS DA CONTA:', margin, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Titular: Sistema de Gestão Financeira Pessoal', margin, yPosition);
      
      yPosition += 6;
      doc.text(`Tipo de Conta: Conta Corrente Eletrônica`, margin, yPosition);
      
      yPosition += 6;
      doc.text(`Período de Movimentação: ${periodStart} a ${periodEnd}`, margin, yPosition);
      
      yPosition += 6;
      doc.text(`Data/Hora de Emissão: ${exportDateTime}`, margin, yPosition);
      
      yPosition += 15;
      
      // Resumo de saldos - obrigatório ABNT
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO DE SALDOS:', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Saldo Anterior: R$ 0,00`, margin, yPosition);
      yPosition += 6;
      
      doc.text(`(+) Total de Créditos: R$ ${data.summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 6;
      
      doc.text(`(-) Total de Débitos: R$ ${data.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`(=) Saldo Atual: R$ ${data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Quantidade de Lançamentos: ${data.transactions.length + data.payments.length}`, margin, yPosition);
      
      yPosition += 20;
      
      // Linha separadora
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Cabeçalho da movimentação
      doc.setFont('helvetica', 'bold');
      doc.text('DETALHAMENTO DAS MOVIMENTAÇÕES:', margin, yPosition);
      yPosition += 10;

      // Cabeçalho das colunas
      doc.setFontSize(9);
      doc.text('Data', margin, yPosition);
      doc.text('Histórico', margin + 25, yPosition);
      doc.text('Documento', margin + 90, yPosition);
      doc.text('Valor (R$)', margin + 120, yPosition);
      doc.text('Saldo (R$)', margin + 155, yPosition);
      
      // Linha sob o cabeçalho
      yPosition += 2;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Variável para calcular saldo progressivo
      let saldoAtual = 0;
      doc.setFont('helvetica', 'normal');

      // Combinar e ordenar todas as movimentações por data
      const allMovements = [
        ...data.transactions.map(t => ({
          date: new Date(t.date),
          type: 'transaction',
          description: t.description,
          category: t.category,
          amount: t.type === 'income' ? t.amount : -t.amount,
          document: t.id.slice(-8).toUpperCase()
        })),
        ...data.payments.map(p => ({
          date: new Date(p.dueDate),
          type: 'payment',
          description: p.description,
          category: 'Pagamento',
          amount: -p.amount,
          document: p.id.slice(-8).toUpperCase(),
          status: p.status
        }))
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      // Listar movimentações
      allMovements.forEach((movement) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 60) {
          addFooter();
          doc.addPage();
          pageNumber++;
          yPosition = addHeader() + 20;
          
          // Repetir cabeçalho das colunas
          doc.setFont('helvetica', 'bold');
          doc.text('CONTINUAÇÃO DAS MOVIMENTAÇÕES:', margin, yPosition);
          yPosition += 10;
          doc.setFontSize(9);
          doc.text('Data', margin, yPosition);
          doc.text('Histórico', margin + 25, yPosition);
          doc.text('Documento', margin + 90, yPosition);
          doc.text('Valor (R$)', margin + 120, yPosition);
          doc.text('Saldo (R$)', margin + 155, yPosition);
          yPosition += 2;
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 8;
          doc.setFont('helvetica', 'normal');
        }

        saldoAtual += movement.amount;

        // Data
        doc.text(movement.date.toLocaleDateString('pt-BR'), margin, yPosition);
        
        // Histórico (descrição + categoria)
        const historico = `${movement.description} - ${movement.category}`;
        const historicoTruncated = historico.length > 20 ? historico.substring(0, 17) + '...' : historico;
        doc.text(historicoTruncated, margin + 25, yPosition);
        
        // Documento
        doc.text(movement.document, margin + 90, yPosition);
        
        // Valor com sinal
        const valorFormatted = movement.amount.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2,
          signDisplay: 'always'
        });
        doc.text(valorFormatted, margin + 120, yPosition);
        
        // Saldo
        const saldoFormatted = saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        doc.text(saldoFormatted, margin + 155, yPosition);
        
        yPosition += 8;
      });

      // Se não há movimentações
      if (allMovements.length === 0) {
        doc.text('Nenhuma movimentação encontrada no período informado.', margin, yPosition);
        yPosition += 15;
      }

      // Rodapé final
      yPosition += 20;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(8);
      doc.text('OBSERVAÇÕES:', margin, yPosition);
      yPosition += 6;
      doc.text('• Este extrato comprova a movimentação da conta no período solicitado.', margin, yPosition);
      yPosition += 4;
      doc.text('• Os valores estão expressos em Real (R$).', margin, yPosition);
      yPosition += 4;
      doc.text('• Documento gerado eletronicamente, dispensando assinatura.', margin, yPosition);

      // Adicionar rodapé na última página
      addFooter();

      // Salvar arquivo
      doc.save(pdfFilename);

      return { success: true, message: 'Extrato PDF gerado com sucesso seguindo normas ABNT!' };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { success: false, message: 'Erro ao gerar extrato PDF' };
    }
  }, []);

  return {
    exportToCSV,
    exportToPDF
  };
};

export default useDataExport;
