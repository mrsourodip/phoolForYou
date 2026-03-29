import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize the Resend client. 
// Requires RESEND_API_KEY in your .env.local file.
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  console.log('[api/send-email] -> POST Called');
  try {
    const body = await req.json();
    const { recipientName, recipientEmail, senderName, message, image } = body;

    // Remove the data URI preamble if it exists
    const base64Data = image ? image.replace(/^data:image\/png;base64,/, '') : '';

    // If RESEND_API_KEY is not configured in ENV, mock the success to avoid breaking the local app testing
    if (!process.env.RESEND_API_KEY) {
      console.log('MOCK EMAIL SENT via Resend. Please add RESEND_API_KEY to your .env.local file!');
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[api/send-email] -> POST Exited (Mocked)');
      return NextResponse.json({ success: true, mocked: true });
    }

    const { data, error } = await resend.emails.send({
      from: `FoolForYou Digital Florist <onboarding@resend.dev>`, 
      to: [recipientEmail],
      subject: `A handcrafted digital bouquet from ${senderName} 💐`,
      html: `
        <div style="font-family: 'Georgia', serif; background-color: #F8F7F3; padding: 40px 20px; color: #333; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border: 1px solid #E5E5E5; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 30px;">
              A Special Delivery
            </p>
            
            <h1 style="font-size: 28px; font-weight: normal; font-style: italic; margin-bottom: 20px;">
              Hello ${recipientName},
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              <strong>${senderName}</strong> has hand-selected and arranged a custom digital bouquet just for you!
            </p>
            
            <!-- Unified card: bouquet + message together -->
            <div style="background-color: #FDFCFA; padding: 30px; border: 1px solid #E5E5E5; border-radius: 8px; margin: 0 0 30px 0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="cid:bouquet-snapshot" alt="Your Custom Bouquet" style="max-width: 280px; width: 100%; height: auto;" />
              </div>
              <p style="font-size: 20px; font-style: italic; line-height: 1.5; white-space: pre-wrap; font-family: 'Times New Roman', Times, serif; text-align: center;">"${message}"</p>
              <p style="font-size: 14px; margin-top: 20px; text-align: right; color: #666;">— ${senderName}</p>
            </div>
            
            <p style="font-size: 12px; color: #AAA; margin-top: 40px; font-family: Arial, sans-serif;">
              <a href="#" style="color: #666; text-decoration: none;">FoolForYou</a>. Be a fool. Send a phool.
            </p>
          </div>
        </div>
      `,
      attachments: image ? [{
        filename: `${senderName.trim()}-Custom-Bouquet.png`,
        content: base64Data,
        contentId: 'bouquet-snapshot'
      }] : []
    });

    if (error) {
      console.error("Resend API Error:", error);
      console.log('[api/send-email] -> POST Exited (Error)');
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log("Resend email success!", data);
    console.log('[api/send-email] -> POST Exited (Success)');
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Email Route Catch Error:", error);
    console.log('[api/send-email] -> POST Exited (Catch Error)');
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
