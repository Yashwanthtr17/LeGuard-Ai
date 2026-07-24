import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken, updateUserById, signInWithPassword } from '@/lib/supabase';
import { updateProfileSchema } from '@/lib/schemas';
import { getProfile, upsertProfile, logActivity } from '@/lib/db';

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

  const { data: { user } } = await getUserByToken(token);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const meta = user.user_metadata || {};
  const profile = getProfile(user.id);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || meta.full_name || '',
    avatar_url: meta.avatar_url || '',
    default_country: profile?.default_country || meta.default_country || 'United States',
    risk_sensitivity: profile?.risk_sensitivity || meta.risk_sensitivity || 'standard',
    theme: profile?.theme || meta.theme || 'system',
    onboarding_complete: !!(profile?.onboarding_complete ?? meta.onboarding_complete),
    created_at: user.created_at,
  });
}

export async function PUT(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const { data: { user } } = await getUserByToken(token);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid input.';
      return NextResponse.json({ error: true, message }, { status: 400 });
    }

    const { current_password, new_password, ...profileFields } = parsed.data;
    const currentMeta = user.user_metadata || {};
    const metadataUpdates: Record<string, unknown> = {};
    const profileUpdates: Record<string, unknown> = {};

    if (profileFields.full_name) {
      metadataUpdates.full_name = profileFields.full_name;
      profileUpdates.full_name = profileFields.full_name;
    }
    if (profileFields.default_country) {
      metadataUpdates.default_country = profileFields.default_country;
      profileUpdates.default_country = profileFields.default_country;
    }
    if (profileFields.risk_sensitivity) {
      metadataUpdates.risk_sensitivity = profileFields.risk_sensitivity;
      profileUpdates.risk_sensitivity = profileFields.risk_sensitivity;
    }
    if (profileFields.theme) {
      metadataUpdates.theme = profileFields.theme;
      profileUpdates.theme = profileFields.theme;
    }
    if (profileFields.onboarding_complete !== undefined) {
      metadataUpdates.onboarding_complete = profileFields.onboarding_complete;
      profileUpdates.onboarding_complete = profileFields.onboarding_complete ? 1 : 0;
    }

    if (Object.keys(metadataUpdates).length > 0) {
      const { error: updateError } = await updateUserById(user.id, {
        user_metadata: { ...currentMeta, ...metadataUpdates },
      });
      if (updateError) {
        return NextResponse.json({ error: true, message: updateError.message }, { status: 400 });
      }
    }

    if (Object.keys(profileUpdates).length > 0) {
      upsertProfile(user.id, profileUpdates);
    }

    if (current_password && new_password) {
      if (new_password.length < 8) {
        return NextResponse.json({ error: true, message: 'New password must be at least 8 characters.' }, { status: 400 });
      }
      if (!user.email) {
        return NextResponse.json({ error: true, message: 'User email not found.' }, { status: 400 });
      }
      const { error: signInError } = await signInWithPassword(user.email!, current_password);
      if (signInError) {
        return NextResponse.json({ error: true, message: 'Current password is incorrect.' }, { status: 400 });
      }
      const { error: pwdError } = await updateUserById(user.id, {
        password: new_password,
      });
      if (pwdError) {
        return NextResponse.json({ error: true, message: pwdError.message }, { status: 400 });
      }
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    logActivity(user.id, 'profile_update', 'User updated profile', ip);

    const { data: { user: updatedUser } } = await getUserByToken(token);
    const meta = updatedUser?.user_metadata || {};
    const profile = getProfile(user.id);

    return NextResponse.json({
      id: updatedUser!.id,
      email: updatedUser!.email,
      full_name: profile?.full_name || meta.full_name || '',
      avatar_url: meta.avatar_url || '',
      default_country: profile?.default_country || meta.default_country || 'United States',
      risk_sensitivity: profile?.risk_sensitivity || meta.risk_sensitivity || 'standard',
      theme: profile?.theme || meta.theme || 'system',
      onboarding_complete: !!(profile?.onboarding_complete ?? meta.onboarding_complete),
    });
  } catch (err) {
    console.error('[me:put] Error:', err);
    return NextResponse.json({ error: true, message: 'Update failed.' }, { status: 500 });
  }
}
