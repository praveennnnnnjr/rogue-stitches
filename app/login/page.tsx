'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      // New Customer Sign Up Logic
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Check your email to confirm or try logging in.' 
        });
        setIsSignUp(false);
      }
    } else {
      // Login Logic
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        // Admin or Customer Redirect
        if (data.user?.email === 'roguestitches.in@gmail.com') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-void text-bone flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-panel border border-seam p-8 rounded-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-2">
          {isSignUp ? 'Create Account' : 'Login'}
        </h2>
        
        {message && (
          <p className={`text-xs text-center p-2 rounded ${message.type === 'error' ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-green-900/40 text-green-400 border border-green-800'}`}>
            {message.text}
          </p>
        )}

        <div>
          <label className="text-xs uppercase text-smoke block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ink border border-seam p-3 rounded text-sm text-bone focus:outline-none"
            placeholder="Enter your email"
            autoComplete="off"
            required
          />
        </div>

        <div>
          <label className="text-xs uppercase text-smoke block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-ink border border-seam p-3 rounded text-sm text-bone focus:outline-none"
            placeholder="Enter your password"
            autoComplete="off"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-bone text-void font-bold py-3 rounded text-xs uppercase tracking-wider hover:bg-smoke transition"
        >
          {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="text-xs text-smoke hover:text-bone underline transition"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
}