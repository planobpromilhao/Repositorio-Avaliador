interface PixApiConfig {
  secretKey: string;
  baseUrl: string;
}

interface TransactionRequest {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  paymentMethod: "PIX";
  amount: number;
  traceable: boolean;
  items: {
    unitPrice: number;
    title: string;
    quantity: number;
    tangible: boolean;
  }[];
  cep?: string;
  complement?: string;
  number?: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  externalId?: string;
}

interface TransactionResponse {
  id: string;
  customId: string;
  installments: number;
  transactionId: string;
  chargeId: string | null;
  expiresAt: string;
  dueAt: string | null;
  approvedAt: string | null;
  refundedAt: string | null;
  rejectedAt: string | null;
  chargebackAt: string | null;
  paymentProvider: string;
  availableAt: string | null;
  pixQrCode: string | null;
  pixCode: string | null;
  billetUrl: string | null;
  billetCode: string | null;
  customerId: string;
  status: string;
  address: string | null;
  district: string | null;
  number: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  amount: number;
  transactionFee: number;
  taxSeller: number;
  taxPlatform: number;
  amountSeller: number;
  amountPlatform: number;
  amountMaster: number;
  amountGarantee: number;
  taxGarantee: number;
  garanteeReleaseAt: string | null;
  approvedEmailSentAt: string | null;
  traceable: boolean;
  method: string;
  deliveryStatus: string | null;
  createdAt: string;
  updatedAt: string;
  utmQuery: string | null;
  checkoutUrl: string | null;
  referrerUrl: string | null;
  externalId: string | null;
  postbackUrl: string | null;
}

interface PaymentDetailsResponse {
  id: string;
  amount: number;
  status: string;
  method: string;
  billetCode: string | null;
  billetUrl: string | null;
  pixCode: string | null;
  pixQrCode: string | null;
  customId: string;
  dueAt: string | null;
  expiresAt: string;
  installments: number;
  items: {
    id: string;
    unitPrice: number;
    quantity: number;
    title: string;
  }[];
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
  deliveryStatus: string | null;
  trackingCode: string | null;
  createdAt: string;
  updatedAt: string;
}

class PixApiService {
  private config: PixApiConfig;

  constructor() {
    this.config = {
      secretKey: '7d04a898-7997-4b07-b7f4-380849f96042',
      baseUrl: 'https://app.ghostspaysv1.com/api/v1'
    };
  }

  /**
   * Cria uma transação PIX seguindo a documentação oficial
   * POST /transaction.purchase
   */
  async createPixTransaction(transactionData: TransactionRequest): Promise<TransactionResponse> {
    console.log('💳 Iniciando criação de transação PIX via GhostPay...', {
      amount: transactionData.amount,
      customer: transactionData.name,
      items: transactionData.items.length
    });

    try {
      // Validar dados obrigatórios
      if (!transactionData.name || transactionData.name.trim() === '') {
        throw new Error('Nome é obrigatório');
      }

      if (!transactionData.email || transactionData.email.trim() === '') {
        throw new Error('E-mail é obrigatório');
      }

      if (!transactionData.cpf || transactionData.cpf.replace(/\D/g, '').length !== 11) {
        throw new Error('CPF deve ter 11 dígitos');
      }

      if (!transactionData.phone || transactionData.phone.replace(/\D/g, '').length < 8) {
        throw new Error('Telefone deve ter pelo menos 8 dígitos');
      }

      if (!transactionData.amount || transactionData.amount < 500) {
        throw new Error('Valor mínimo da transação é R$ 5,00 (500 centavos)');
      }

      if (!transactionData.items || transactionData.items.length === 0) {
        throw new Error('Lista de itens é obrigatória');
      }

      // Preparar dados da requisição seguindo a documentação
      const requestBody: TransactionRequest = {
        name: transactionData.name.trim(),
        email: transactionData.email.trim().toLowerCase(),
        cpf: transactionData.cpf.replace(/\D/g, ''), // CPF apenas números
        phone: transactionData.phone.replace(/\D/g, ''), // Telefone apenas números
        paymentMethod: "PIX",
        amount: transactionData.amount,
        traceable: true,
        items: transactionData.items,
        ...(transactionData.cep && { cep: transactionData.cep.replace(/\D/g, '') }),
        ...(transactionData.complement && { complement: transactionData.complement.trim() }),
        ...(transactionData.number && { number: transactionData.number.trim() }),
        ...(transactionData.street && { street: transactionData.street.trim() }),
        ...(transactionData.district && { district: transactionData.district.trim() }),
        ...(transactionData.city && { city: transactionData.city.trim() }),
        ...(transactionData.state && { state: transactionData.state.trim() }),
        ...(transactionData.externalId && { externalId: transactionData.externalId.trim() })
      };

      console.log('📤 Enviando requisição para GhostPay:', {
        endpoint: `${this.config.baseUrl}/transaction.purchase`,
        method: 'POST',
        customer: requestBody.name,
        amount: `R$ ${(requestBody.amount / 100).toFixed(2)}`,
        items: requestBody.items.length
      });

      const response = await fetch(`${this.config.baseUrl}/transaction.purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.secretKey,
          'User-Agent': 'Shopee-Integration/1.0'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Status da criação da transação GhostPay:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(async () => {
          const errorText = await response.text();
          return { error: errorText };
        });
        
        console.error('❌ Erro na criação da transação PIX via GhostPay:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // Tratar erros específicos da API
        if (response.status === 400) {
          throw new Error('Dados inválidos para criação da transação. Verifique os dados informados.');
        } else if (response.status === 401) {
          throw new Error('Chave de API inválida ou expirada.');
        } else if (response.status === 422) {
          throw new Error('Dados de transação inválidos. Verifique os campos obrigatórios.');
        } else if (response.status >= 500) {
          throw new Error('Erro interno do servidor GhostPay. Tente novamente em alguns minutos.');
        }

        throw new Error(`Erro ao criar transação PIX: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const transaction: TransactionResponse = await response.json();
      
      console.log('✅ Transação PIX criada com sucesso via GhostPay!', {
        id: transaction.id,
        amount: `R$ ${(transaction.amount / 100).toFixed(2)}`,
        status: transaction.status,
        customId: transaction.customId,
        expiresAt: transaction.expiresAt,
        pixCode: transaction.pixCode ? 'Gerado' : 'Não disponível',
        pixQrCode: transaction.pixQrCode ? 'Gerado' : 'Não disponível'
      });

      return transaction;
    } catch (error) {
      console.error('💥 Erro ao criar transação PIX via GhostPay:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Falha inesperada ao gerar transação PIX. Tente novamente.');
    }
  }

  /**
   * Consulta os detalhes de uma transação seguindo a documentação oficial
   * GET /transaction.getPayment
   */
  async getPaymentDetails(transactionId: string): Promise<PaymentDetailsResponse> {
    console.log('🔍 Consultando detalhes da transação via GhostPay:', transactionId);

    try {
      if (!transactionId || transactionId.trim() === '') {
        throw new Error('ID da transação é obrigatório');
      }

      const response = await fetch(`${this.config.baseUrl}/transaction.getPayment?id=${encodeURIComponent(transactionId.trim())}`, {
        method: 'GET',
        headers: {
          'Authorization': this.config.secretKey,
          'Accept': 'application/json',
          'User-Agent': 'Shopee-Integration/1.0'
        }
      });

      console.log('📡 Status da consulta de detalhes GhostPay:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(async () => {
          const errorText = await response.text();
          return { error: errorText };
        });

        console.error('❌ Erro na consulta de detalhes via GhostPay:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        if (response.status === 404) {
          throw new Error('Transação não encontrada');
        } else if (response.status === 401) {
          throw new Error('Chave de API inválida ou expirada.');
        }

        throw new Error(`Erro ao consultar detalhes: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const paymentDetails: PaymentDetailsResponse = await response.json();
      
      console.log('✅ Detalhes da transação consultados com sucesso via GhostPay:', {
        id: paymentDetails.id,
        status: paymentDetails.status,
        amount: `R$ ${(paymentDetails.amount / 100).toFixed(2)}`,
        method: paymentDetails.method,
        pixCode: paymentDetails.pixCode ? 'Disponível' : 'Não disponível',
        pixQrCode: paymentDetails.pixQrCode ? 'Disponível' : 'Não disponível'
      });
      
      return paymentDetails;
    } catch (error) {
      console.error('💥 Erro ao consultar detalhes da transação via GhostPay:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Falha ao consultar detalhes do pagamento');
    }
  }

  /**
   * Método de teste para verificar se a integração está funcionando
   */
  async testConnection(): Promise<boolean> {
    console.log('🧪 Testando conexão com GhostPay API...');
    
    try {
      // Criar uma transação de teste pequena
      const testTransaction: TransactionRequest = {
        name: 'Usuario Teste',
        email: 'teste@exemplo.com',
        cpf: '12345678901',
        phone: '16999999999',
        paymentMethod: 'PIX',
        amount: 500, // R$ 5,00 em centavos (valor mínimo)
        traceable: true,
        items: [
          {
            unitPrice: 500,
            title: 'Teste de integração GhostPay',
            quantity: 1,
            tangible: false
          }
        ],
        externalId: `test_ghostpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const result = await this.createPixTransaction(testTransaction);
      
      if (result && result.id) {
        console.log('✅ Teste de criação de transação GhostPay bem-sucedido!', {
          id: result.id,
          status: result.status,
          pixCode: result.pixCode ? 'Gerado' : 'Não disponível'
        });
        
        // Testar consulta de detalhes
        const details = await this.getPaymentDetails(result.id);
        console.log('✅ Teste de consulta de detalhes GhostPay bem-sucedido!', details.status);
        
        return true;
      }

      console.error('❌ Teste falhou: Transação não foi criada corretamente');
      return false;
    } catch (error) {
      console.error('❌ Teste de conexão GhostPay falhou:', error);
      return false;
    }
  }

  /**
   * Obter informações da configuração atual (para debug)
   */
  getConfigInfo(): any {
    return {
      baseUrl: this.config.baseUrl,
      hasSecretKey: !!this.config.secretKey,
      secretKeyLength: this.config.secretKey?.length || 0
    };
  }
}

// Instância singleton do serviço
export const pixApiService = new PixApiService();

// Exportar tipos para uso em outros arquivos
export type { TransactionRequest, TransactionResponse, PaymentDetailsResponse };