import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        401 — Authentication Required
      </h1>
      <p className="mt-2 text-xs text-slate-600 max-w-sm">
        You must be authenticated with a verified AICTE institutional or official account to access this resource.
      </p>
      <div className="mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f294a] text-white text-xs font-semibold shadow-xs hover:bg-[#1b3d6b] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Proceed to Login
        </Link>
      </div>
    </div>
  );
}
