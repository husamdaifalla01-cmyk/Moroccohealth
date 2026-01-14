// ==============================================
// DAWA.ma CMI Payment Integration API
// Centre Monetique Interbancaire - Morocco's card payment processor
// ==============================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// CMI Configuration (from environment variables)
const CMI_CONFIG = {
  merchantId: process.env.CMI_MERCHANT_ID!,
  storeKey: process.env.CMI_STORE_KEY!,
  apiUrl: process.env.CMI_API_URL || 'https://testpayment.cmi.co.ma',
  callbackUrl: process.env.CMI_CALLBACK_URL!,
  okUrl: process.env.CMI_OK_URL!,
  failUrl: process.env.CMI_FAIL_URL!,
};

interface PaymentInitRequest {
  order_id: string;
  amount: number; // In MAD (Dirhams)
  customer_email: string;
  customer_phone: string;
  description?: string;
}

interface PaymentInitResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

// Generate CMI hash for request authentication
function generateCMIHash(params: Record<string, string>): string {
  // CMI requires specific order of parameters for hash
  const orderedKeys = [
    'clientid',
    'oid',
    'amount',
    'okUrl',
    'failUrl',
    'trantype',
    'instalment',
    'rnd',
    'currency',
    'lang',
    'storetype',
    'hashAlgorithm',
    'encoding',
  ];

  const hashString = orderedKeys
    .map((key) => params[key] || '')
    .join('|')
    .concat('|', CMI_CONFIG.storeKey);

  return crypto.createHash('sha512').update(hashString).digest('base64');
}

// Initialize payment
export async function POST(request: NextRequest) {
  try {
    const body: PaymentInitRequest = await request.json();

    if (!body.order_id || !body.amount || !body.customer_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const transactionId = `CMI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // CMI requires amount in centimes (multiply by 100)
    const amountInCentimes = Math.round(body.amount * 100);

    // Build CMI payment form parameters
    const params: Record<string, string> = {
      clientid: CMI_CONFIG.merchantId,
      oid: body.order_id,
      amount: amountInCentimes.toString(),
      okUrl: CMI_CONFIG.okUrl,
      failUrl: CMI_CONFIG.failUrl,
      trantype: 'Auth', // Authorization transaction
      instalment: '1', // Single payment
      rnd: transactionId,
      currency: '504', // MAD (Moroccan Dirham)
      lang: 'fr', // French language
      storetype: '3D_PAY_HOSTING', // 3D Secure with CMI hosted page
      hashAlgorithm: 'ver3', // SHA-512
      encoding: 'UTF-8',
      email: body.customer_email,
      tel: body.customer_phone || '',
      BillToName: body.description || `Commande ${body.order_id}`,
      callbackUrl: CMI_CONFIG.callbackUrl,
    };

    // Generate hash
    params.hash = generateCMIHash(params);

    // Build form URL
    const formHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Redirection vers le paiement...</title>
      </head>
      <body onload="document.getElementById('cmiForm').submit();">
        <p>Redirection vers la page de paiement securise...</p>
        <form id="cmiForm" method="POST" action="${CMI_CONFIG.apiUrl}/fim/est3Dgate">
          ${Object.entries(params)
            .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
            .join('\n')}
        </form>
      </body>
      </html>
    `;

    // Return the payment initialization data
    const response: PaymentInitResponse = {
      success: true,
      payment_url: `${CMI_CONFIG.apiUrl}/fim/est3Dgate`,
      transaction_id: transactionId,
    };

    // Also return form data for direct POST
    return NextResponse.json({
      ...response,
      form_params: params,
      form_html: formHtml,
    });
  } catch (error) {
    console.error('CMI Payment Init Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed',
      },
      { status: 500 }
    );
  }
}

// Handle CMI callback (payment result)
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract CMI response parameters
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Verify response hash
    const receivedHash = params.HASH;
    const responseStatus = params.Response;
    const orderId = params.oid;
    const amount = params.amount;
    const transactionId = params.TransId;
    const authCode = params.AuthCode;
    const procReturnCode = params.ProcReturnCode;

    // Check if payment was successful
    const isApproved = procReturnCode === '00' && responseStatus === 'Approved';

    // Log the transaction result
    console.log('CMI Payment Result:', {
      orderId,
      amount,
      transactionId,
      authCode,
      status: isApproved ? 'approved' : 'declined',
      procReturnCode,
    });

    if (isApproved) {
      // Payment successful - update order in database
      // This would typically call the orders API to update payment status
      return NextResponse.json({
        success: true,
        status: 'approved',
        order_id: orderId,
        transaction_id: transactionId,
        auth_code: authCode,
        message: 'Paiement accepte',
      });
    } else {
      // Payment failed
      return NextResponse.json({
        success: false,
        status: 'declined',
        order_id: orderId,
        error_code: procReturnCode,
        message: getErrorMessage(procReturnCode),
      });
    }
  } catch (error) {
    console.error('CMI Callback Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Callback processing failed',
      },
      { status: 500 }
    );
  }
}

// CMI error messages in French
function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    '00': 'Transaction approuvee',
    '01': 'Contacter la banque emettrice',
    '02': 'Contacter la banque emettrice',
    '03': 'Commercant invalide',
    '04': 'Carte a retenir',
    '05': 'Transaction non autorisee',
    '12': 'Transaction invalide',
    '13': 'Montant invalide',
    '14': 'Numero de carte invalide',
    '30': 'Erreur de format',
    '33': 'Carte expiree',
    '34': 'Suspicion de fraude',
    '41': 'Carte perdue',
    '43': 'Carte volee',
    '51': 'Fonds insuffisants',
    '54': 'Carte expiree',
    '57': 'Transaction non permise',
    '58': 'Transaction non permise',
    '61': 'Limite de montant depassee',
    '62': 'Carte restreinte',
    '65': 'Limite de frequence depassee',
    '75': 'Tentatives PIN depassees',
    '76': 'Compte bloque',
    '91': 'Emetteur indisponible',
    '96': 'Erreur systeme',
    default: 'Transaction refusee',
  };

  return errorMessages[code] || errorMessages['default'];
}
