import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('bouquets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(16);

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('Fetch bouquets exception:', err);
    return NextResponse.json({ 
      error: 'Failed to fetch bouquets', 
      details: err.message,
      suggestion: 'Check if the "bouquets" table exists in your Supabase project.' 
    }, { status: 500 });
  }
}

export async function POST(req) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { image, flowers, message, senderName, recipientName } = body;

    const { data, error } = await supabase
      .from('bouquets')
      .insert([
        { 
          image_data: image, 
          flower_data: flowers, 
          message, 
          sender_name: senderName,
          recipient_name: recipientName 
        }
      ])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Save bouquet error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
