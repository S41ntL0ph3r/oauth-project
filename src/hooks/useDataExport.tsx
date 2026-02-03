import { useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import PDFDocument from '@/components/PDFDocument';

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
      // Alterar extensão para .xls para forçar Excel a aplicar formatação automática
      const csvFilename = filename || `extrato_movimentacoes_${new Date().toISOString().split('T')[0]}.xls`;

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

      // Criar HTML simples que o Excel reconhece como tabela
      let htmlContent = `
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: Calibri, sans-serif; font-size: 11pt; }
.header { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 20px; }
.summary { margin-bottom: 20px; }
.summary-title { font-weight: bold; margin-bottom: 10px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
th { background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #000; text-align: center; }
td { padding: 6px; border: 1px solid #CCCCCC; }
.number { text-align: right; }
.center { text-align: center; }
.alternate { background-color: #F2F2F2; }
.total-row { font-weight: bold; background-color: #D5E3F0; }
.formula { font-style: italic; color: #0070C0; }
</style>
</head>
<body>
<div class="header">EXTRATO DE MOVIMENTAÇÕES FINANCEIRAS - SISTEMA DE GESTÃO</div>

<div class="summary">
<div class="summary-title">INFORMAÇÕES GERAIS</div>
<p><strong>Data de Geração:</strong> ${exportDateTime}</p>
<p><strong>Total de Transações:</strong> ${data.transactions.length}</p>
<p><strong>Total de Pagamentos:</strong> ${data.payments.length}</p>
<p><strong>Total de Movimentações:</strong> ${data.transactions.length + data.payments.length}</p>
</div>

<div class="summary">
<div class="summary-title">RESUMO FINANCEIRO</div>
<table>
<tr><th>Categoria</th><th>Valor (R$)</th></tr>
<tr><td><strong>Total de Receitas</strong></td><td class="number">${data.summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
<tr class="alternate"><td><strong>Total de Despesas</strong></td><td class="number">${data.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
<tr class="total-row"><td><strong>Saldo Líquido</strong></td><td class="number">${data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
</table>
</div>

<div class="summary-title">DETALHAMENTO DAS MOVIMENTAÇÕES</div>
<table>
<tr>
<th>Data</th>
<th>Tipo</th>
<th>Categoria</th>
<th>Descrição</th>
<th>Valor Original</th>
<th>Débito</th>
<th>Crédito</th>
<th>Saldo Acumulado</th>
<th>Documento</th>
<th>Status</th>
<th>Vencimento</th>
<th>Observações</th>
</tr>`;

      // Calcular saldo acumulado e adicionar linhas de dados
      let saldoAcumulado = 0;
      allMovements.forEach((movement, index) => {
        const valor = movement.isCredit ? movement.originalAmount : -movement.originalAmount;
        saldoAcumulado += valor;
        const isAlternate = index % 2 === 1;
        
        htmlContent += `
<tr${isAlternate ? ' class="alternate"' : ''}>
<td class="center">${movement.date.toLocaleDateString('pt-BR')}</td>
<td>${movement.type}</td>
<td>${movement.category}</td>
<td>${movement.description}</td>
<td class="number">${movement.originalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
<td class="number">${movement.isCredit ? '' : movement.originalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
<td class="number">${movement.isCredit ? movement.originalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}</td>
<td class="number">${saldoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
<td class="center">${movement.document}</td>
<td class="center">${movement.status}</td>
<td class="center">${new Date(movement.dueDate).toLocaleDateString('pt-BR')}</td>
<td>${movement.observations}</td>
</tr>`;
      });

      // Adicionar linha de totais
      htmlContent += `
<tr class="total-row">
<td colspan="5"><strong>TOTAIS:</strong></td>
<td class="number"><strong>${data.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
<td class="number"><strong>${data.summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
<td class="number"><strong>${data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
<td colspan="4"></td>
</tr>
</table>

<div class="summary">
<div class="summary-title">ANÁLISES ESTATÍSTICAS</div>
<table>
<tr><th>Métrica</th><th>Valor</th></tr>
<tr><td>Maior Débito</td><td class="number">${allMovements.filter(m => !m.isCredit).length > 0 ? Math.max(...allMovements.filter(m => !m.isCredit).map(m => m.originalAmount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td></tr>
<tr class="alternate"><td>Maior Crédito</td><td class="number">${allMovements.filter(m => m.isCredit).length > 0 ? Math.max(...allMovements.filter(m => m.isCredit).map(m => m.originalAmount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td></tr>
<tr><td>Média de Débitos</td><td class="number">${allMovements.filter(m => !m.isCredit).length > 0 ? (allMovements.filter(m => !m.isCredit).reduce((sum, m) => sum + m.originalAmount, 0) / allMovements.filter(m => !m.isCredit).length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td></tr>
<tr class="alternate"><td>Média de Créditos</td><td class="number">${allMovements.filter(m => m.isCredit).length > 0 ? (allMovements.filter(m => m.isCredit).reduce((sum, m) => sum + m.originalAmount, 0) / allMovements.filter(m => m.isCredit).length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td></tr>
<tr><td>Quantidade de Débitos</td><td class="number">${allMovements.filter(m => !m.isCredit).length}</td></tr>
<tr class="alternate"><td>Quantidade de Créditos</td><td class="number">${allMovements.filter(m => m.isCredit).length}</td></tr>
</table>
</div>

<p><em>Documento gerado automaticamente em ${exportDateTime}</em></p>
<p><em>Este arquivo pode ser salvo como Excel (.xlsx) através do menu Arquivo > Salvar Como</em></p>

</body>
</html>`;

      // Criar e baixar arquivo HTML que o Excel reconhece
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.ms-excel;charset=utf-8;' 
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

      return { success: true, message: 'Planilha Excel formatada exportada com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      return { success: false, message: 'Erro ao exportar planilha Excel' };
    }
  }, []);

  // Função para exportar em PDF com React-PDF
  const exportToPDF = useCallback(async (data: ExportData, filename?: string) => {
    try {
      const pdfFilename = filename || `extrato_movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`;

      // Gerar blob do PDF
      const blob = await pdf(<PDFDocument data={data} />).toBlob();
      
      // Criar link para download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', pdfFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, message: 'Extrato PDF gerado com sucesso!' };
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
