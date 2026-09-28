import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString, isValidEmail } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/audit-logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rateCheck = checkRateLimit(req, 'contact_submit', { windowMs: 60 * 1000, max: 5 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: `Too many submissions. Please try again in ${rateCheck.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message, website_hp } = body;

    // Honeypot anti-bot check
    if (website_hp) {
      logSecurityEvent({
        event: 'SPAMBOT_HONEYPOT_TRIGGERED',
        severity: 'WARNING',
        endpoint: '/api/contact',
      });
      return NextResponse.json({ success: false, message: 'Invalid submission' }, { status: 400 });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanRecord = {
      id: `CNT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: sanitizeString(name),
      email: sanitizeString(email),
      subject: sanitizeString(subject || 'General Inquiry'),
      message: sanitizeString(message),
      created_at: new Date().toISOString(),
    };

    // Try saving to Supabase if table exists, otherwise log safely
    try {
      const { error } = await supabaseAdmin
        .from('inveins_contact_enquiries')
        .insert(cleanRecord);

      if (error) {
        console.warn('Notice: contact inquiry could not be saved to inveins_contact_enquiries table (table might not exist yet):', error.message);
      }
    } catch (dbErr) {
      console.warn('DB write for contact inquiry failed:', dbErr);
    }

    console.log(`[CONTACT INQUIRY RECEIVED] From: ${cleanRecord.name} <${cleanRecord.email}> | Subject: ${cleanRecord.subject}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! Our team will get back to you shortly.',
      inquiryId: cleanRecord.id,
    });
  } catch (error) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error processing contact submission.' },
      { status: 500 }
    );
  }
}
