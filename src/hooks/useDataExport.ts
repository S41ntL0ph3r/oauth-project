import { useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

// Estender o tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
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

      // Título
      doc.setFontSize(20);
      doc.text('Relatório Financeiro', pageWidth / 2, 25, { align: 'center' });

      // Data de exportação
      doc.setFontSize(12);
      doc.text(`Exportado em: ${exportDate}`, pageWidth / 2, 35, { align: 'center' });

      // Resumo financeiro
      let yPosition = 55;
      doc.setFontSize(16);
      doc.text('Resumo Financeiro', 20, yPosition);

      const summaryItems = [
        ['Total de Receitas', `R$ ${data.summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Total de Despesas', `R$ ${data.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Saldo Líquido', `R$ ${data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Total de Transações', data.summary.totalTransactions.toString()],
        ['Total de Pagamentos', data.summary.totalPayments.toString()]
      ];

      // Tabela de resumo
      doc.autoTable({
        startY: yPosition + 15,
        head: [['Item', 'Valor']],
        body: summaryItems,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60, halign: 'right' }
        }
      });

      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 150;

      // Transações
      if (data.transactions.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(16);
        doc.text('Transações', 20, yPosition);

        const transactionsTableData = data.transactions.map(transaction => [
          transaction.description,
          transaction.category,
          transaction.type === 'income' ? 'Receita' : 'Despesa',
          `R$ ${transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          new Date(transaction.date).toLocaleDateString('pt-BR')
        ]);

        doc.autoTable({
          startY: yPosition + 10,
          head: [['Descrição', 'Categoria', 'Tipo', 'Valor', 'Data']],
          body: transactionsTableData,
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [52, 152, 219], textColor: 255 }
        });

        yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : yPosition + 50;
      }

      // Pagamentos
      if (data.payments.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(16);
        doc.text('Pagamentos', 20, yPosition);

        const paymentsTableData = data.payments.map(payment => [
          payment.description,
          `R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          new Date(payment.dueDate).toLocaleDateString('pt-BR'),
          payment.status === 'completed' ? 'Pago' : 
          payment.status === 'overdue' ? 'Vencido' : 'Pendente'
        ]);

        doc.autoTable({
          startY: yPosition + 10,
          head: [['Descrição', 'Valor', 'Vencimento', 'Status']],
          body: paymentsTableData,
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [155, 89, 182], textColor: 255 }
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
