import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, updateUserById, signInWithPassword } from '@/lib/supabase';
import { updateProfileSchema } from '@/lib/schemas';
import { recordActivity } from '@/lib/services/activity';

function serializeUser(user: {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  default_country: string | null;
  risk_sensitivity: string | null;
  theme: string | null;
  onboarding_complete: boolean | null;
  created_at?: string;
}) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name || '',
    avatar_url: user.avatar_url || '',
    default_country: user.default_country || 'United States',
    risk_sensitivity: user.risk_sensitivity || 'standard',
    theme: user.theme || 'system',
    onboarding_complete: !!user.onboarding_complete,
    ...(user.created_at ? { created_at: user.created_at } : {}),
  };
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json(serializeUser(user));
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
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
    const updates: Record<string, unknown> = {};

    if (profileFields.full_name) updates.full_name = profileFields.full_name;
    if (profileFields.default_country) updates.default_country = profileFields.default_country;
    if (profileFields.risk_sensitivity) updates.risk_sensitivity = profileFields.risk_sensitivity;
    if (profileFields.theme) updates.theme = profileFields.theme;
    if (profileFields.onboarding_complete !== undefined) {
      updates.onboarding_complete = profileFields.onboarding_complete;
    }

    if (Object.keys(updates).length > 0) {
      await updateUserById(user.id, {
        user_metadata: updates,
      });
    }

    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { error: true, message: 'Current password is required to set a new password.' },
          { status: 400 }
        );
      }

      const { error: signInError } = await signInWithPassword(user.email, current_password);
      if (signInError) {
        return NextResponse.json(
          { error: true, message: 'Current password is incorrect.' },
          { status: 400 }
        );
      }

      await updateUserById(user.id, {
        password: new_password,
      });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    await recordActivity(user.id, 'profile_update', 'User updated profile', ip);

    const updatedUser = await getUserFromRequest(req);
    if (!updatedUser) {
      return NextResponse.json({ error: true, message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(serializeUser(updatedUser));
  } catch (err) {
    console.error('[me:put] Error:', err);
    return NextResponse.json({ error: true, message: 'Update failed.' }, { status: 500 });
  }
}
