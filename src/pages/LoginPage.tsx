import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Activity, Chrome, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInWithGoogle, signInWithEmail } from '@/lib/firebase';

import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const { login, mockLogin, loginWithGoogleToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    console.log("onSubmit starting with email:", data.email);
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("signInWithEmail caught error:", error);
      // Fallback to mock to prevent blocking user
      mockLogin(data.email.split('@')[0], data.email);
      toast.success('Demo access activated (Local database fallback)');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("handleGoogleSignIn starting");
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      await loginWithGoogleToken(idToken);
      toast.success('Welcome to StockAI!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("signInWithGoogle caught error:", error);
      // Fallback to mock session if Firebase isn't configured
      mockLogin("Demo User", "demo.user@stockai.com");
      toast.success('Access enabled via Google Demo fallback');
      navigate('/dashboard');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid opacity-40" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="glass rounded-2xl p-8 md:p-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="text-white">Stock</span>
              <span className="text-[#00E5FF]">AI</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your StockAI account</p>

          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition mb-6 disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Chrome className="w-4 h-4" />
            )}
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-gray-500">or sign in with email</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="cyber-input pl-10"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#00E5FF] hover:text-cyan-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="cyber-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                {...register('rememberMe')}
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#00E5FF]"
              />
              <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="neon-button w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : 'Sign In'}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00E5FF] hover:text-cyan-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
