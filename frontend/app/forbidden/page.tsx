import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        403 — Access Forbidden
      </h1>
      <p className="mt-2 text-xs text-slate-600 max-w-md">
        Your current role does not possess statutory authorization to view or execute actions on this resource. Institutional boundaries and separation of duties are enforced by PostgreSQL Row-Level Security.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

