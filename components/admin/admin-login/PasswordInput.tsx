'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PasswordInput() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id="password"
        name="password"
        type={show ? 'text' : 'password'}
        placeholder="Enter password"
        required
        className="rounded-xl border-neutral-200 font-mukta focus-visible:ring-[#611508] focus-visible:ring-offset-0 pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
