'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FDRService } from '@/lib/supabase/service';
import { SystemRole } from '@/lib/types/database';

export async function signInAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '/dashboard';

  if (!email) {
    return { error: 'Please enter your institutional email address.' };
  }

  // 1. Check if Supabase client can authenticate with password
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'Password@123',
    });

    if (!error && data?.user) {
      const cookieStore = await cookies();
      cookieStore.set('aicte_session_role', 'institution_user', { path: '/', maxAge: 86400 });
      redirect(next);
    }
  } catch (err: any) {
    // If NEXT_REDIRECT, rethrow
    if (err?.digest?.includes('NEXT_REDIRECT')) throw err;
  }

  // 2. Fallback matching against profiles database
  const profiles = await FDRService.getProfiles();
  const matched = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

  if (matched) {
    await FDRService.switchActiveUserRole(matched.system_role);
    const cookieStore = await cookies();
    cookieStore.set('aicte_session_role', matched.system_role, { path: '/', maxAge: 86400 });
    redirect(next);
  }

  return { error: 'Invalid institutional credentials or unauthorized account.' };
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const cookieStore = await cookies();
  cookieStore.delete('aicte_session_role');
  redirect('/login');
}

export async function switchPersonaAction(role: SystemRole) {
  await FDRService.switchActiveUserRole(role);
  const cookieStore = await cookies();
  cookieStore.set('aicte_session_role', role, { path: '/', maxAge: 86400 });
  redirect('/dashboard');
}

export async function resetPasswordAction(email: string) {
  if (!email) return { error: 'Email address is required.' };
  try {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/auth/reset-password`,
    });
  } catch {}
  return { success: true, message: 'If an active account exists, password recovery instructions have been sent.' };
}
