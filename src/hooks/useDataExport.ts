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
      const exportDate = new Date().toLocaleDateString('pt-BR');
      const csvFilename = filename || `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;

      // Preparar dados das transações
      const transactionsData = data.transactions.map(transaction => ({
        'Tipo': 'Transação',
        'Descrição': transaction.description,
        'Categoria': transaction.category,
        'Tipo de Transação': transaction.type === 'income' ? 'Receita' : 'Despesa',
        'Valor (R$)': transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        'Data': new Date(transaction.date).toLocaleDateString('pt-BR'),
        'Status': '-'
      }));

      // Preparar dados dos pagamentos
      const paymentsData = data.payments.map(payment => ({
        'Tipo': 'Pagamento',
        'Descrição': payment.description,
        'Categoria': 'Pagamentos',
        'Tipo de Transação': 'Despesa',
        'Valor (R$)': payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        'Data': new Date(payment.dueDate).toLocaleDateString('pt-BR'),
        'Status': payment.status === 'completed' ? 'Pago' : 
                 payment.status === 'overdue' ? 'Vencido' : 'Pendente'
      }));

      // Combinar dados
      const allData = [...transactionsData, ...paymentsData];

      // Adicionar resumo no final
      const summaryData = [
        { 'Tipo': '', 'Descrição': '', 'Categoria': '', 'Tipo de Transação': '', 'Valor (R$)': '', 'Data': '', 'Status': '' },
        { 'Tipo': 'RESUMO', 'Descrição': '', 'Categoria': '', 'Tipo de Transação': '', 'Valor (R$)': '', 'Data': '', 'Status': '' },
        { 'Tipo': 'Total Receitas', 'Descrição': '', 'Categoria': '', 'Tipo de Transação': '', 'Valor (R$)': data.summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 'Data': '', 'Status': '' },
        { 'Tipo': 'Total Despesas', 'Descrição': '', 'Categoria': '', 'Tipo de Transação': '', 'Valor (R$)': data.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 'Data': '', 'Status': '' },
        { 'Tipo': 'Saldo Líquido', 'Descrição': '', 'Categoria': '', 'Tipo de Transação': '', 'Valor (R$)': data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 'Data': '', 'Status': '' },
        { 'Tipo': 'Data da Exportação', 'Descrição': exportDate, 'Categoria': '', 'Tipo de Transação': '', 'Valor (R$)': '', 'Data': '', 'Status': '' },
      ];

      const finalData = [...allData, ...summaryData];

      // Converter para CSV
      const csv = Papa.unparse(finalData, {
        delimiter: ';',
        header: true
      });

      // Download do arquivo
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', csvFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'Arquivo CSV exportado com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return { success: false, message: 'Erro ao exportar arquivo CSV' };
    }
  }, []);

  // Função para exportar em PDF
  const exportToPDF = useCallback((data: ExportData, filename?: string) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const exportDate = new Date().toLocaleDateString('pt-BR');
      const pdfFilename = filename || `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`;

      let yPosition = 25;

      // Título
      doc.setFontSize(20);
      doc.text('Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Data de exportação
      doc.setFontSize(12);
      doc.text(`Exportado em: ${exportDate}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 25;

      // Resumo financeiro
      doc.setFontSize(16);
      doc.text('Resumo Financeiro', 20, yPosition);
      yPosition += 15;

      // Dados do resumo
      doc.setFontSize(12);
      const summaryLines = [
        `Total de Receitas: R$ ${data.summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `Total de Despesas: R$ ${data.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `Saldo Líquido: R$ ${data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `Total de Transações: ${data.summary.totalTransactions}`,
        `Total de Pagamentos: ${data.summary.totalPayments}`
      ];

      summaryLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 15;

      // Transações
      if (data.transactions.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(16);
        doc.text('Transações', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        
        data.transactions.forEach((transaction, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 25;
          }

          const typeText = transaction.type === 'income' ? 'Receita' : 'Despesa';
          const amountText = `R$ ${transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          const dateText = new Date(transaction.date).toLocaleDateString('pt-BR');

          doc.text(`${index + 1}. ${transaction.description}`, 20, yPosition);
          doc.text(`${transaction.category} | ${typeText}`, 20, yPosition + 6);
          doc.text(`${amountText} | ${dateText}`, 20, yPosition + 12);
          
          yPosition += 20;
        });

        yPosition += 15;
      }

      // Pagamentos
      if (data.payments.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(16);
        doc.text('Pagamentos', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);

        data.payments.forEach((payment, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 25;
          }

          const statusText = payment.status === 'completed' ? 'Pago' : 
                           payment.status === 'overdue' ? 'Vencido' : 'Pendente';
          const amountText = `R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          const dueDateText = new Date(payment.dueDate).toLocaleDateString('pt-BR');

          doc.text(`${index + 1}. ${payment.description}`, 20, yPosition);
          doc.text(`${amountText} | Venc: ${dueDateText}`, 20, yPosition + 6);
          doc.text(`Status: ${statusText}`, 20, yPosition + 12);
          
          yPosition += 20;
        });
      }

      // Salvar arquivo
      doc.save(pdfFilename);

      return { success: true, message: 'Arquivo PDF exportado com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { success: false, message: 'Erro ao exportar arquivo PDF' };
    }
  }, []);

  return {
    exportToCSV,
    exportToPDF
  };
};

export default useDataExport;
