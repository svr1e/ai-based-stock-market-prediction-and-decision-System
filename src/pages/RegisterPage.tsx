import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Activity, Chrome, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInWithGoogle, signUpWithEmail, updateUserProfile, auth } from '@/lib/firebase';

import { useAuthStore } from '@/store/authStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const { registerUser, mockLogin, loginWithGoogleToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    console.log("onSubmit register starting with email:", data.email);
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.name);
      toast.success('Account created! Welcome to StockAI 🚀');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("signUpWithEmail caught error:", error);
      // Fallback to mock session
      mockLogin(data.name, data.email);
      toast.success('Account created via Demo mode (Backend fallback)');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("handleGoogleSignIn starting in RegisterPage");
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      await loginWithGoogleToken(idToken);
      toast.success('Welcome to StockAI!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("signInWithGoogle caught error:", error);
      // Fallback to mock session
      mockLogin("Demo User", "demo.user@stockai.com");
      toast.success('Access enabled via Google Demo fallback');
      navigate('/dashboard');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
      <div className="absolute inset-0 cyber-grid opacity-40" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/3 right-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 md:p-10">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="text-white">Stock</span>
              <span className="text-[#00E5FF]">AI</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-8">Start your AI-powered trading journey</p>

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

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-gray-500">or register with email</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input {...register('name')} placeholder="John Doe" className="cyber-input pl-10" />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="cyber-input pl-10" />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="cyber-input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="cyber-input pl-10" />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="neon-button w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00E5FF] hover:text-cyan-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
