import { PaymentMethod } from '../types/shop';

export interface MockPaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  paymentDetails: {
    // Card payment details
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardHolderName?: string;
    
    // Mobile money details
    phoneNumber?: string;
    provider?: string;
    
    // Bank transfer details
    accountNumber?: string;
    bankCode?: string;
    
    // Other details
    description?: string;
  };
  orderId?: string;
  reservationId?: string;
}

export interface MockPaymentResponse {
  success: boolean;
  transactionId: string;
  paymentReference: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message: string;
  timestamp: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

// Mock test data for different payment methods
export const MOCK_PAYMENT_TEST_DATA = {
  CARD: {
    cardNumber: '4532-1234-5678-9012',
    expiryDate: '12/27',
    cvv: '123',
    cardHolderName: 'John Doe',
  },
  CREDIT_CARD: {
    cardNumber: '5555-4444-3333-2222',
    expiryDate: '06/28',
    cvv: '456',
    cardHolderName: 'Jane Smith',
  },
  MOBILE_MONEY: {
    phoneNumber: '+251911123456',
    provider: 'M-Pesa',
  },
  MOBILE: {
    phoneNumber: '+251922654321',
    provider: 'HelloCash',
  },
  TELEBIRR: {
    phoneNumber: '+251987654321',
    provider: 'TeleBirr',
  },
  CBE_BIRR: {
    phoneNumber: '+251911987654',
    provider: 'CBE Birr',
  },
  BANK_TRANSFER: {
    accountNumber: '1234567890123456',
    bankCode: 'CBE001',
    bankName: 'Commercial Bank of Ethiopia',
  },
  CASH: {
    description: 'Cash payment at counter',
  },
  ROOM_CHARGE: {
    description: 'Charge to room bill',
  },
  PAY_AT_FRONTDESK: {
    description: 'Payment at front desk',
  },
};

class MockPaymentGateway {
  private static instance: MockPaymentGateway;
  private processingDelay = 2000; // 2 seconds delay to simulate real payment processing

  private constructor() {}

  public static getInstance(): MockPaymentGateway {
    if (!MockPaymentGateway.instance) {
      MockPaymentGateway.instance = new MockPaymentGateway();
    }
    return MockPaymentGateway.instance;
  }

  /**
   * Process payment through mock gateway
   * Always returns success for testing purposes
   */
  public async processPayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, this.processingDelay));

    // Generate mock transaction ID
    const transactionId = this.generateTransactionId();
    const paymentReference = this.generatePaymentReference(request.paymentMethod);

    // Always return success for testing
    return {
      success: true,
      transactionId,
      paymentReference,
      status: 'SUCCESS',
      message: this.getSuccessMessage(request.paymentMethod),
      timestamp: new Date().toISOString(),
      amount: request.amount,
      currency: request.currency,
      paymentMethod: request.paymentMethod,
    };
  }

  /**
   * Get pre-filled test data for a payment method
   */
  public getTestData(paymentMethod: PaymentMethod): any {
    switch (paymentMethod) {
      case PaymentMethod.CARD:
        return MOCK_PAYMENT_TEST_DATA.CARD;
      case PaymentMethod.CREDIT_CARD:
        return MOCK_PAYMENT_TEST_DATA.CREDIT_CARD;
      case PaymentMethod.MOBILE_MONEY:
        return MOCK_PAYMENT_TEST_DATA.MOBILE_MONEY;
      case PaymentMethod.MOBILE:
        return MOCK_PAYMENT_TEST_DATA.MOBILE;
      case PaymentMethod.CASH:
        return MOCK_PAYMENT_TEST_DATA.CASH;
      case PaymentMethod.ROOM_CHARGE:
        return MOCK_PAYMENT_TEST_DATA.ROOM_CHARGE;
      case PaymentMethod.PAY_AT_FRONTDESK:
        return MOCK_PAYMENT_TEST_DATA.PAY_AT_FRONTDESK;
      default:
        return {};
    }
  }

  /**
   * Pre-fill form with test data
   */
  public fillTestData(paymentMethod: PaymentMethod): {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardName?: string;
    phoneNumber?: string;
    provider?: string;
    accountNumber?: string;
    bankCode?: string;
  } {
    const testData = this.getTestData(paymentMethod);
    
    return {
      cardNumber: testData.cardNumber || '',
      cardExpiry: testData.expiryDate || '',
      cardCvv: testData.cvv || '',
      cardName: testData.cardHolderName || '',
      phoneNumber: testData.phoneNumber || '',
      provider: testData.provider || '',
      accountNumber: testData.accountNumber || '',
      bankCode: testData.bankCode || '',
    };
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN_${timestamp}_${random}`;
  }

  private generatePaymentReference(paymentMethod: PaymentMethod): string {
    const timestamp = Date.now();
    const methodCode = this.getMethodCode(paymentMethod);
    const random = Math.floor(Math.random() * 1000);
    return `${methodCode}_${timestamp}_${random}`;
  }

  private getMethodCode(paymentMethod: PaymentMethod): string {
    switch (paymentMethod) {
      case PaymentMethod.CARD:
      case PaymentMethod.CREDIT_CARD:
        return 'CARD';
      case PaymentMethod.MOBILE_MONEY:
      case PaymentMethod.MOBILE:
        return 'MOBILE';
      case PaymentMethod.CASH:
        return 'CASH';
      case PaymentMethod.ROOM_CHARGE:
        return 'ROOM';
      case PaymentMethod.PAY_AT_FRONTDESK:
        return 'DESK';
      default:
        return 'MISC';
    }
  }

  private getSuccessMessage(paymentMethod: PaymentMethod): string {
    switch (paymentMethod) {
      case PaymentMethod.CARD:
      case PaymentMethod.CREDIT_CARD:
        return 'Card payment processed successfully';
      case PaymentMethod.MOBILE_MONEY:
      case PaymentMethod.MOBILE:
        return 'Mobile money payment completed';
      case PaymentMethod.CASH:
        return 'Cash payment confirmed';
      case PaymentMethod.ROOM_CHARGE:
        return 'Amount charged to room successfully';
      case PaymentMethod.PAY_AT_FRONTDESK:
        return 'Payment scheduled at front desk';
      default:
        return 'Payment processed successfully';
    }
  }

  /**
   * Set processing delay for testing
   */
  public setProcessingDelay(delay: number): void {
    this.processingDelay = delay;
  }

  /**
   * Validate payment data (always returns true for mock)
   */
  public validatePaymentData(paymentMethod: PaymentMethod, paymentDetails: any): boolean {
    // In a real implementation, this would validate the payment data
    // For mock purposes, always return true
    return true;
  }
}

export const mockPaymentGateway = MockPaymentGateway.getInstance();

// Export utility functions
export const useMockPayment = () => {
  return {
    processPayment: (request: MockPaymentRequest) => mockPaymentGateway.processPayment(request),
    getTestData: (paymentMethod: PaymentMethod) => mockPaymentGateway.getTestData(paymentMethod),
    fillTestData: (paymentMethod: PaymentMethod) => mockPaymentGateway.fillTestData(paymentMethod),
    validatePaymentData: (paymentMethod: PaymentMethod, details: any) => 
      mockPaymentGateway.validatePaymentData(paymentMethod, details),
  };
};