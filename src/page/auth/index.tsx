import { useState, type FC, type FormEvent } from 'react';
import {
  useLoginMutation,
  useRegisterMutation,
} from '../../store/services/api';
import { useNavigate } from 'react-router-dom';

const AuthPage: FC = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [login, { isLoading: loginLoading, error: loginError }] =
    useLoginMutation();
  const [register, { isLoading: registerLoading, error: registerError }] =
    useRegisterMutation();

  const switchForm = () => {
    setFormType(formType === 'login' ? 'register' : 'login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formType === 'register' && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      if (formType === 'login') {
        const result = await login({ email, password }).unwrap();
        localStorage.setItem('token', result.access_token);

        navigate('/', { replace: false });
      } else {
        await register({ email, password }).unwrap();
        setFormType('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      alert(
        'Error: ' + (error.data?.message || error.error || 'Unknown error')
      );
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-white flex items-center justify-center px-4 py-12'>
      <div className='bg-white rounded-3xl shadow-xl w-full max-w-md p-10'>
        <h2 className='text-3xl font-extrabold mb-8 text-center text-amber-600 drop-shadow-md'>
          {formType === 'login' ? 'Welcome Back!' : 'Create an Account'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <label htmlFor='email' className='block'>
            <span className='text-gray-700 font-semibold mb-1 block'>
              Email
            </span>
            <input
              id='email'
              name='email'
              type='email'
              required
              className='w-full rounded-md border border-gray-300 px-4 py-3 text-base
                     focus:border-lime-500 focus:ring-2 focus:ring-lime-400 focus:outline-none
                     transition'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete='email'
              placeholder='example@example.com'
            />
          </label>

          <label htmlFor='password' className='block'>
            <span className='text-gray-700 font-semibold mb-1 block'>
              Password
            </span>
            <input
              id='password'
              name='password'
              type='password'
              required
              className='w-full rounded-md border border-gray-300 px-4 py-3 text-base
                     focus:border-lime-500 focus:ring-2 focus:ring-lime-400 focus:outline-none
                     transition'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                formType === 'login' ? 'current-password' : 'new-password'
              }
              placeholder='••••••••'
            />
          </label>

          {formType === 'register' && (
            <label htmlFor='confirmPassword' className='block'>
              <span className='text-gray-700 font-semibold mb-1 block'>
                Confirm Password
              </span>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                className='w-full rounded-md border border-gray-300 px-4 py-3 text-base
                       focus:border-lime-500 focus:ring-2 focus:ring-lime-400 focus:outline-none
                       transition'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete='new-password'
                placeholder='••••••••'
              />
            </label>
          )}

          <button
            type='submit'
            disabled={loginLoading || registerLoading}
            className='w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 rounded-lg shadow-md
             transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {formType === 'login' ? 'Log In' : 'Register'}
          </button>
        </form>

        <p className='mt-6 text-center text-gray-700 font-medium select-none'>
          {formType === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            onClick={switchForm}
            className='text-lime-600 hover:text-lime-700 hover:underline focus:outline-none'
          >
            {formType === 'login' ? 'Register' : 'Log In'}
          </button>
        </p>

        {(loginError || registerError) && (
          <p className='mt-4 text-center text-red-600 font-semibold'>
            {(loginError as any)?.data?.message ||
              (registerError as any)?.data?.message ||
              'Request error'}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
