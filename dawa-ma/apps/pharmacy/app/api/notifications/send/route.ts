// ==============================================
// DAWA.ma Notification Service API
// Multi-channel notifications (SMS, Push, Email, WhatsApp)
// ==============================================

import { NextRequest, NextResponse } from 'next/server';

// Notification templates for Morocco
const TEMPLATES: Record<string, Record<string, { fr: string; ar: string }>> = {
  order_confirmed: {
    sms: {
      fr: 'DAWA.ma: Votre commande {{order_number}} a ete confirmee. Livraison prevue dans {{eta}}. Suivez: {{tracking_url}}',
      ar: 'DAWA.ma: تم تاكيد طلبك {{order_number}}. التسليم المتوقع في {{eta}}. تتبع: {{tracking_url}}',
    },
    push: {
      fr: 'Commande confirmee! Livraison dans {{eta}}',
      ar: 'تم تاكيد الطلب! التسليم في {{eta}}',
    },
    email: {
      fr: 'Votre commande {{order_number}} a ete confirmee et sera livree dans {{eta}}.',
      ar: 'تم تاكيد طلبك {{order_number}} وسيتم تسليمه في {{eta}}.',
    },
  },
  prescription_verified: {
    sms: {
      fr: 'DAWA.ma: Votre ordonnance a ete verifiee. Preparation en cours.',
      ar: 'DAWA.ma: تم التحقق من وصفتك الطبية. الاعداد جار.',
    },
    push: {
      fr: 'Ordonnance verifiee! En preparation...',
      ar: 'تم التحقق من الوصفة! جار التحضير...',
    },
  },
  courier_assigned: {
    sms: {
      fr: 'DAWA.ma: {{courier_name}} est en route! Tel: {{courier_phone}}. ETA: {{eta}}',
      ar: 'DAWA.ma: {{courier_name}} في الطريق! هاتف: {{courier_phone}}. الوصول: {{eta}}',
    },
    push: {
      fr: '{{courier_name}} est en route vers vous!',
      ar: '{{courier_name}} في الطريق اليك!',
    },
  },
  delivery_arrived: {
    sms: {
      fr: 'DAWA.ma: Votre livreur est arrive! Montant: {{amount}} DH',
      ar: 'DAWA.ma: وصل المندوب! المبلغ: {{amount}} درهم',
    },
    push: {
      fr: 'Votre livreur est arrive!',
      ar: 'وصل المندوب!',
    },
  },
  delivery_completed: {
    sms: {
      fr: 'DAWA.ma: Livraison terminee! Merci pour votre confiance. Evaluez: {{rating_url}}',
      ar: 'DAWA.ma: تم التسليم! شكرا لثقتكم. قيم: {{rating_url}}',
    },
    push: {
      fr: 'Livraison terminee! Merci',
      ar: 'تم التسليم! شكرا',
    },
  },
  prescription_rejected: {
    sms: {
      fr: 'DAWA.ma: Votre ordonnance necessite verification. Contactez-nous: {{support_phone}}',
      ar: 'DAWA.ma: وصفتك تحتاج مراجعة. اتصل بنا: {{support_phone}}',
    },
    push: {
      fr: 'Verification necessaire pour votre ordonnance',
      ar: 'مطلوب التحقق من وصفتك',
    },
  },
  pharmacy_new_order: {
    push: {
      fr: 'Nouvelle commande {{order_number}}! Priorite: {{priority}}',
      ar: 'طلب جديد {{order_number}}! الاولوية: {{priority}}',
    },
  },
  courier_new_delivery: {
    push: {
      fr: 'Nouvelle livraison disponible! {{pharmacy_name}} -> {{distance}} km',
      ar: 'توصيل جديد متاح! {{pharmacy_name}} -> {{distance}} كم',
    },
  },
};

interface NotificationRequest {
  user_id: string;
  user_type: 'patient' | 'pharmacist' | 'courier';
  template_id: string;
  channels: ('sms' | 'push' | 'email' | 'whatsapp')[];
  language: 'fr' | 'ar';
  data: Record<string, string>;
  recipient?: {
    phone?: string;
    email?: string;
    push_token?: string;
  };
}

interface NotificationResult {
  success: boolean;
  sent_channels: string[];
  failed_channels: { channel: string; error: string }[];
  notification_id: string;
}

// SMS Provider Configuration (Morocco)
const SMS_CONFIG = {
  provider: process.env.SMS_PROVIDER || 'smsbox', // smsbox.ma or similar
  apiKey: process.env.SMS_API_KEY!,
  senderId: process.env.SMS_SENDER_ID || 'DAWA.ma',
  apiUrl: process.env.SMS_API_URL || 'https://api.smsbox.ma',
};

// Push Notification (Firebase/Expo)
async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  // In production, this would use Firebase Admin SDK or Expo Push API
  console.log('Push notification:', { token, title, body, data });

  // Mock implementation
  // const firebaseResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     to: token,
  //     notification: { title, body },
  //     data,
  //   }),
  // });

  return true;
}

// SMS (Morocco providers: SMSBox, Infobip, etc.)
async function sendSMS(
  phone: string,
  message: string
): Promise<boolean> {
  // Normalize Moroccan phone number
  let normalizedPhone = phone.replace(/\s/g, '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '+212' + normalizedPhone.substring(1);
  }
  if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+212' + normalizedPhone;
  }

  console.log('SMS:', { phone: normalizedPhone, message });

  // Mock implementation - in production, use actual SMS provider
  // const response = await fetch(`${SMS_CONFIG.apiUrl}/send`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${SMS_CONFIG.apiKey}`,
  //   },
  //   body: JSON.stringify({
  //     to: normalizedPhone,
  //     from: SMS_CONFIG.senderId,
  //     message,
  //   }),
  // });

  return true;
}

// Email (using any SMTP service)
async function sendEmail(
  email: string,
  subject: string,
  body: string
): Promise<boolean> {
  console.log('Email:', { email, subject, body });

  // Mock implementation - in production, use Resend, SendGrid, etc.
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     from: 'DAWA.ma <notifications@dawa.ma>',
  //     to: email,
  //     subject,
  //     text: body,
  //   }),
  // });

  return true;
}

// WhatsApp (using WhatsApp Business API)
async function sendWhatsApp(
  phone: string,
  message: string
): Promise<boolean> {
  console.log('WhatsApp:', { phone, message });

  // Mock implementation - in production, use WhatsApp Business API
  return true;
}

// Render template with data
function renderTemplate(template: string, data: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(data)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return rendered;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();

    const template = TEMPLATES[body.template_id];
    if (!template) {
      return NextResponse.json(
        { success: false, error: `Template not found: ${body.template_id}` },
        { status: 400 }
      );
    }

    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sentChannels: string[] = [];
    const failedChannels: { channel: string; error: string }[] = [];

    for (const channel of body.channels) {
      try {
        const channelTemplate = template[channel];
        if (!channelTemplate) {
          failedChannels.push({ channel, error: 'Template not available for this channel' });
          continue;
        }

        const message = renderTemplate(channelTemplate[body.language], body.data);

        switch (channel) {
          case 'sms':
            if (!body.recipient?.phone) {
              failedChannels.push({ channel, error: 'Phone number required' });
              continue;
            }
            const smsSuccess = await sendSMS(body.recipient.phone, message);
            if (smsSuccess) sentChannels.push(channel);
            else failedChannels.push({ channel, error: 'SMS sending failed' });
            break;

          case 'push':
            if (!body.recipient?.push_token) {
              failedChannels.push({ channel, error: 'Push token required' });
              continue;
            }
            const pushTitle = body.template_id
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());
            const pushSuccess = await sendPushNotification(
              body.recipient.push_token,
              pushTitle,
              message,
              body.data
            );
            if (pushSuccess) sentChannels.push(channel);
            else failedChannels.push({ channel, error: 'Push sending failed' });
            break;

          case 'email':
            if (!body.recipient?.email) {
              failedChannels.push({ channel, error: 'Email required' });
              continue;
            }
            const emailSubject = `DAWA.ma - ${body.template_id.replace(/_/g, ' ')}`;
            const emailSuccess = await sendEmail(body.recipient.email, emailSubject, message);
            if (emailSuccess) sentChannels.push(channel);
            else failedChannels.push({ channel, error: 'Email sending failed' });
            break;

          case 'whatsapp':
            if (!body.recipient?.phone) {
              failedChannels.push({ channel, error: 'Phone number required' });
              continue;
            }
            const waSuccess = await sendWhatsApp(body.recipient.phone, message);
            if (waSuccess) sentChannels.push(channel);
            else failedChannels.push({ channel, error: 'WhatsApp sending failed' });
            break;
        }
      } catch (error) {
        failedChannels.push({
          channel,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const result: NotificationResult = {
      success: sentChannels.length > 0,
      sent_channels: sentChannels,
      failed_channels: failedChannels,
      notification_id: notificationId,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Notification Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Notification failed',
      },
      { status: 500 }
    );
  }
}
