import { NextResponse } from 'next/server';
import { db } from '@/lib/data/store';
import { auth } from '@/lib/auth';
import { generateProjectCode } from '@/lib/utils/dates';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const codes = db.getAllProjectCodes();
    const code = generateProjectCode(codes);

    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
