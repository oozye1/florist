import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth
    if (password === 'admin' || password === 'flower') {
      onLogin();
    } else {
      setError('Invalid passkey. Try "admin".');
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-serif text-gray-900">Admin Access</h2>
          <p className="text-gray-500 mt-2 text-sm">Please enter your secure passkey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            label="Passkey"
            placeholder="Enter passkey..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />
          
          <Button type="submit" className="w-full">
            Enter Dashboard
          </Button>

          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Back to Store
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};