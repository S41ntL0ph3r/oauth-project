import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '2px solid black',
    paddingBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4472C4',
    color: 'white',
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
  },
  col1: { width: '12%' },
  col2: { width: '25%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '18%' },
  col6: { width: '15%' },
  summary: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
    color: 'gray',
  },
});

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

interface ExportData {
  transactions: Transaction[];
  payments: Payment[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    totalTransactions: number;
    totalPayments: number;
  };
}

interface PDFDocumentProps {
  data: ExportData;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ data }) => {
  const exportDateTime = new Date().toLocaleString('pt-BR');

  // Combinar e ordenar todas as movimentações por data
  const allMovements = [
    ...data.transactions.map(t => ({
      date: new Date(t.date),
      description: t.description,
      category: t.category,
      amount: t.type === 'income' ? t.amount : -t.amount,
      document: t.id.slice(-8).toUpperCase(),
      isCredit: t.type === 'income',
    })),
    ...data.payments.map(p => ({
      date: new Date(p.dueDate),
      description: p.description,
      category: 'Pagamento',
      amount: -p.amount,
      document: p.id.slice(-8).toUpperCase(),
      isCredit: false,
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calcular saldo progressivo
  let saldoAtual = 0;
  const movementsWithBalance = allMovements.map(m => {
    saldoAtual += m.amount;
    return { ...m, saldo: saldoAtual };
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text>EXTRATO DE MOVIMENTACOES BANCARIAS</Text>
        </View>

        {/* Informações da conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DADOS DA CONTA</Text>
          <Text style={styles.text}>Titular: Sistema de Gestao Financeira Pessoal</Text>
          <Text style={styles.text}>Tipo de Conta: Conta Corrente Eletronica</Text>
          <Text style={styles.text}>Data/Hora de Emissao: {exportDateTime}</Text>
        </View>

        {/* Resumo financeiro */}
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>RESUMO DE SALDOS</Text>
          <View style={styles.summaryRow}>
            <Text>Saldo Anterior:</Text>
            <Text>R$ 0,00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>(+) Total de Creditos:</Text>
            <Text>R$ {data.summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>(-) Total de Debitos:</Text>
            <Text>R$ {data.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={[styles.summaryRow, styles.bold]}>
            <Text style={styles.bold}>(=) Saldo Atual:</Text>
            <Text style={styles.bold}>R$ {data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Quantidade de Lancamentos:</Text>
            <Text>{data.transactions.length + data.payments.length}</Text>
          </View>
        </View>

        {/* Tabela de movimentações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALHAMENTO DAS MOVIMENTACOES</Text>
          
          {/* Cabeçalho da tabela */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Data</Text>
            <Text style={styles.col2}>Descricao</Text>
            <Text style={styles.col3}>Categoria</Text>
            <Text style={styles.col3}>Documento</Text>
            <Text style={styles.col4}>Valor (R$)</Text>
            <Text style={styles.col5}>Saldo (R$)</Text>
          </View>

          {/* Linhas da tabela */}
          {movementsWithBalance.length > 0 ? (
            movementsWithBalance.map((movement, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.col1}>{movement.date.toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.col2}>{movement.description.length > 20 ? movement.description.substring(0, 17) + '...' : movement.description}</Text>
                <Text style={styles.col3}>{movement.category}</Text>
                <Text style={styles.col3}>{movement.document}</Text>
                <Text style={styles.col4}>
                  {movement.amount.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2,
                    signDisplay: 'always'
                  })}
                </Text>
                <Text style={styles.col5}>{movement.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <Text>Nenhuma movimentacao encontrada no periodo informado.</Text>
            </View>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Este documento foi gerado eletronicamente e e valido sem assinatura fisica.</Text>
          <Text>Documento gerado em {exportDateTime}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;
