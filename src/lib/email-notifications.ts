import { supabaseAdmin } from './admin-supabase-server'

interface EmailNotificationParams {
    to: string
    subject: string
    html: string
}

// Email template for notifications
function createNotificationEmailTemplate(
    title: string,
    message: string,
    orderId?: string,
    actionUrl?: string
): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                TechNitro
              </h1>
              <p style="margin: 8px 0 0 0; color: #e9d5ff; font-size: 14px;">
                Order Notification
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #f1f5f9; font-size: 24px; font-weight: 600;">
                ${title}
              </h2>
              <p style="margin: 0 0 24px 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                ${message}
              </p>
              
              ${orderId ? `
              <div style="background-color: #334155; border-left: 4px solid #7c3aed; padding: 16px; margin-bottom: 24px; border-radius: 8px;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Order ID
                </p>
                <p style="margin: 4px 0 0 0; color: #facc15; font-size: 18px; font-weight: 700; font-family: monospace;">
                  #${orderId.slice(0, 8)}
                </p>
              </div>
              ` : ''}
              
              ${actionUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.3);">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                Thank you for shopping with TechNitro
              </p>
              <p style="margin: 0; color: #475569; font-size: 12px;">
                © ${new Date().getFullYear()} TechNitro. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Send email using Resend API
async function sendEmailViaResend(params: EmailNotificationParams): Promise<boolean> {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
        console.warn('RESEND_API_KEY not configured. Email notifications disabled.')
        return false
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'TechNitro <notifications@technitro.com>',
                to: params.to,
                subject: params.subject,
                html: params.html
            })
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('Resend API error:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Failed to send email:', error)
        return false
    }
}

// Main function to send notification email
export async function sendNotificationEmail(
    userId: string,
    type: string,
    title: string,
    message: string,
    orderId?: string
): Promise<void> {
    try {
        // Check if user has email notifications enabled
        const { data: preferences } = await supabaseAdmin
            .from('NotificationPreference')
            .select('emailNotifications')
            .eq('userId', userId)
            .single()

        if (preferences && !preferences.emailNotifications) {
            console.log('Email notifications disabled for user:', userId)
            return
        }

        // Get user email from Supabase Auth
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId)

        if (error || !user?.email) {
            console.error('Failed to get user email:', error)
            return
        }

        // Create action URL for order tracking
        const actionUrl = orderId
            ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track-order?id=${orderId}`
            : undefined

        // Generate email HTML
        const html = createNotificationEmailTemplate(title, message, orderId, actionUrl)

        // Send email
        await sendEmailViaResend({
            to: user.email,
            subject: `${title} - TechNitro`,
            html
        })

        console.log(`Email notification sent to ${user.email}`)
    } catch (error) {
        console.error('Error sending notification email:', error)
    }
}
