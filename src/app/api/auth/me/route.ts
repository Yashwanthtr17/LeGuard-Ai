import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabaseAuth } from '@/lib/supabase';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const meta = user.user_metadata || {};

  return NextResponse.json({
    id: user.id,
    full_name: meta.full_name || '',
    email: user.email,
    default_country: meta.default_country || 'United States',
    risk_sensitivity: meta.risk_sensitivity || 'standard',
    onboarding_complete: !!meta.onboarding_complete,
  });
}

export async function PUT(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const { data: { user }, error: userError } = await getSupabaseAdmin().auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentMeta = user.user_metadata || {};
    const metadataUpdates: Record<string, unknown> = {};

    if (body.full_name) metadataUpdates.full_name = body.full_name;
    if (body.default_country) metadataUpdates.default_country = body.default_country;
    if (body.risk_sensitivity) metadataUpdates.risk_sensitivity = body.risk_sensitivity;
    if (body.onboarding_complete !== undefined) metadataUpdates.onboarding_complete = body.onboarding_complete;

    if (Object.keys(metadataUpdates).length > 0) {
      const { error: updateError } = await getSupabaseAdmin().auth.admin.updateUserById(user.id, {
        user_metadata: { ...currentMeta, ...metadataUpdates },
      });
      if (updateError) {
        return NextResponse.json({ error: true, message: updateError.message }, { status: 400 });
      }
    }

    if (body.current_password && body.new_password) {
      if (body.new_password.length < 8) {
        return NextResponse.json({ error: true, message: 'New password must be at least 8 characters.' }, { status: 400 });
      }
      if (!user.email) {
        return NextResponse.json({ error: true, message: 'User email not found.' }, { status: 400 });
      }
      const { error: signInError } = await getSupabaseAuth().auth.signInWithPassword({
        email: user.email,
        password: body.current_password,
      });
      if (signInError) {
        return NextResponse.json({ error: true, message: 'Current password is incorrect.' }, { status: 400 });
      }
      const { error: pwdError } = await getSupabaseAdmin().auth.admin.updateUserById(user.id, {
        password: body.new_password,
      });
      if (pwdError) {
        return NextResponse.json({ error: true, message: pwdError.message }, { status: 400 });
      }
    }

    const { data: { user: updatedUser } } = await getSupabaseAdmin().auth.getUser(token);
    const meta = updatedUser?.user_metadata || {};

    return NextResponse.json({
      id: updatedUser!.id,
      full_name: meta.full_name || '',
      email: updatedUser!.email,
      default_country: meta.default_country || 'United States',
      risk_sensitivity: meta.risk_sensitivity || 'standard',
      onboarding_complete: !!meta.onboarding_complete,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: true, message: 'Update failed.' }, { status: 500 });
  }
}
