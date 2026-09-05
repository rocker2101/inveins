import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sanitizeString, isValidEmail, isValidPhone } from '@/lib/sanitize';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, phone, cityCountry, productInterest, quantity, message } = body;

    if (!name || !phone || !email) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address.' },
        { status: 400 }
      );
    }

    const enquiryId = `WS-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const cleanRecord = {
      id: enquiryId,
      name: sanitizeString(name),
      company: sanitizeString(company || ''),
      email: sanitizeString(email),
      phone: sanitizeString(phone),
      city_country: sanitizeString(cityCountry || ''),
      product_interest: sanitizeString(productInterest || 'Custom B2B Order'),
      quantity: sanitizeString(quantity || '50-100 pcs'),
      message: sanitizeString(message || ''),
      created_at: nowIso,
    };

    const { error } = await supabase.from('inveins_wholesale_enquiries').insert(cleanRecord);

    if (error) {
      console.error('Supabase error inserting wholesale enquiry:', error);
      return NextResponse.json(
        { success: false, message: 'Database error saving enquiry.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Wholesale enquiry submitted successfully.',
      enquiry: {
        id: cleanRecord.id,
        name: cleanRecord.name,
        company: cleanRecord.company,
        email: cleanRecord.email,
        phone: cleanRecord.phone,
        cityCountry: cleanRecord.city_country,
        productInterest: cleanRecord.product_interest,
        quantity: cleanRecord.quantity,
        message: cleanRecord.message,
        createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      },
    });
  } catch (err: any) {
    console.error('Error submitting wholesale enquiry:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
