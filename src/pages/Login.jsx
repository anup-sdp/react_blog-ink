// src/pages/Login.jsx
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import useAuthContext from '../hooks/useAuthContext';
import useToast from '../hooks/useToast';
import { useState } from 'react';

function Login() {
  console.log('in login function');
  const { loginUser, resendActivationEmail, requestPasswordReset, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  // local UI states for resend/reset
  const [resendLoading, setResendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [localErrorMsg, setLocalErrorMsg] = useState('');

  const onSubmit = async (data) => {
    setLocalErrorMsg('');
    setSuccessMsg('');
    const result = await loginUser(data);

    if (result.success) {
      navigate('/');
    } else {
      // prefer result.message if provided, else a generic message
      const message = result.message || 'Login failed';
      toast.addToast(message, 'error');
    }
  };

  const handleResendActivation = async () => {
    setLocalErrorMsg('');
    setSuccessMsg('');

    // try to read email from the form values
    const email = getValues('email') || '';

    if (!email) {
      setLocalErrorMsg('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    try {
      const resp = await resendActivationEmail(email);
      if (resp.success) {
        setSuccessMsg('If your account needs activation, an email has been sent to your inbox.');
      } else {
        const msg = resp.message || 'Failed to send activation email. Please try again.';
        setLocalErrorMsg(msg);
      }
    } catch (err) {
      console.error('Resend activation error', err);
      setLocalErrorMsg('Failed to send activation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLocalErrorMsg('');
    setSuccessMsg('');

    const email = getValues('email') || '';

    if (!email) {
      setLocalErrorMsg('Please enter your email address first');
      return;
    }

    setResetLoading(true);
    try {
      const resp = await requestPasswordReset(email);
      if (resp.success) {
        setSuccessMsg('Password reset email sent successfully! Check your inbox.');
      } else {
        const msg = resp.message || 'Failed to send password reset email. Please try again.';
        setLocalErrorMsg(msg);
      }
    } catch (err) {
      console.error('Reset password error', err);
      setLocalErrorMsg('Failed to send password reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">Login to BlogInk</h1>

        {/* Inline success/error display (optional; you also use toast) */}
        {(localErrorMsg) && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{localErrorMsg}</div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded bg-green-50 text-green-700">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              {...register('username', { required: 'Username is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Email field used for resend activation / password reset (optional for login) */}
          <div>
            <label className="block text-gray-700 mb-2">Email (for activation / reset)</label>
            <input
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Only needed if you want to resend activation or reset password</p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <hr className="my-6" />

        <div className="text-center space-y-3">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>

          {/* Resend activation */}
          <p className="text-gray-600">
            Need account activation?{' '}
            <button
              type="button"
              onClick={handleResendActivation}
              className="text-blue-500 hover:underline disabled:opacity-60"
              disabled={resendLoading || isLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend activation email'}
            </button>
          </p>

          {/* Reset password */}
          <p className="text-gray-600">
            Forgot your password?{' '}
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-blue-500 hover:underline disabled:opacity-60"
              disabled={resetLoading || isLoading}
            >
              {resetLoading ? 'Sending...' : 'Reset password'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
