import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, KeyRound, Users, University, Hospital, Lock, User as UserIcon, Mail, Phone, Building, Star, ShieldAlert } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import { useToast } from '../hooks/useToast';
import { User, UserRole, UserStatus } from '../types';

interface LoginPageProps {
  onAttemptLogin: (credentials: { username: string; password?: string; role: UserRole }) => User | null;
  onAdminRegister: (user: User) => boolean;
}

const Feature: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center space-x-3"
  >
    <div className="bg-indigo-500/10 p-2 rounded-full ring-1 ring-indigo-500/20">{icon}</div>
    <span className="text-slate-300">{text}</span>
  </motion.li>
);

const LoginPage: React.FC<LoginPageProps> = ({ onAttemptLogin, onAdminRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.LEVEL1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');

  const { addToast } = useToast();

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        addToast('Please enter a username and password.', 'error');
        return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const loggedInUser = onAttemptLogin({ username, password, role: selectedRole });
      setIsLoading(false);
      if (loggedInUser) {
        addToast(`Logged in as ${loggedInUser.username} (${loggedInUser.role})!`, 'success');
      } else {
        addToast('Login failed. Invalid credentials or role.', 'error');
      }
    }, 1000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        const loggedInUser = onAttemptLogin({ username, password, role: UserRole.ADMIN });
        setIsLoading(false);
        if (loggedInUser) {
            addToast(`Admin login successful! Welcome back.`, 'success');
        } else {
            addToast('Invalid admin credentials.', 'error');
        }
    }, 1000);
  };
  
  const handleAdminSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add validation here
    if (!firstName || !lastName || !email || !orgName || !username || !password) {
        addToast('Please fill all required fields.', 'error');
        setIsLoading(false);
        return;
    }
    
    const newAdminUser: User = {
        id: `admin-${Date.now()}`,
        username,
        password,
        role: UserRole.ADMIN,
        roleName: 'Administrator',
        status: UserStatus.ACTIVE,
        organization: orgName,
        attributes: ['role:admin', 'access:all'],
    };

    setTimeout(() => {
        const success = onAdminRegister(newAdminUser);
        setIsLoading(false);
        if (success) {
            addToast(`Admin account for ${username} created! Please login.`, 'success');
            setIsLoginView(true); // switch to login view
            // Clear form
            setUsername('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setPhone('');
            setEmail('');
            setOrgName('');
        } else {
            addToast('Username is already taken, please try another.', 'error');
        }
    }, 1000);
  };

  const renderLoginForm = () => (
      <form onSubmit={isAdmin ? handleAdminLogin : handleUserLogin} className="space-y-6">
        <Input 
          id="username" 
          label="Username" 
          placeholder="Enter your username" 
          icon={<UserIcon className="h-5 w-5 text-slate-400"/>} 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <Input 
          id="password" 
          type="password" 
          label="Password" 
          placeholder="••••••••" 
          icon={<Lock className="h-5 w-5 text-slate-400"/>} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {!isAdmin && (
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">User Role</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full rounded-lg border-slate-700 bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 custom-select py-2.5 px-3"
            >
              {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Checkbox id="remember-me" label="Remember me" />
          <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">Forgot password?</a>
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Authenticating...' : 'Login'}
        </Button>
        {isAdmin && (
            <p className="text-center text-sm text-slate-400">
                Not an admin? <button type="button" onClick={() => setIsAdmin(false)} className="font-semibold text-indigo-400 hover:text-indigo-300">Login as User</button>
            </p>
        )}
      </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleAdminSignup} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <Input id="firstName" label="First Name" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)}/>
            <Input id="lastName" label="Last Name" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)}/>
        </div>
        <Input id="email" type="email" label="Email" placeholder="jane.doe@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail className="h-5 w-5 text-slate-400"/>}/>
        <Input id="orgName" label="Organization Name" placeholder="Acme Corporation" value={orgName} onChange={e => setOrgName(e.target.value)} icon={<Building className="h-5 w-5 text-slate-400"/>}/>
        <hr className="border-slate-700"/>
        <Input id="signup-username" label="Username" placeholder="janedoe" value={username} onChange={e => setUsername(e.target.value)} icon={<UserIcon className="h-5 w-5 text-slate-400"/>}/>
        <Input id="signup-password" type="password" label="Password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock className="h-5 w-5 text-slate-400"/>}/>

        <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
        </Button>
    </form>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block text-left"
        >
          <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
            Welcome to <br />
            <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 text-transparent bg-clip-text">SmartCrypt</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            The next-generation platform for secure file sharing, offering unparalleled data protection with advanced cryptographic solutions.
          </p>
          <ul className="space-y-4">
            <Feature icon={<ShieldCheck className="h-6 w-6 text-indigo-400"/>} text="End-to-End Encryption (AES & RSA)" />
            <Feature icon={<ShieldAlert className="h-6 w-6 text-purple-400"/>} text="Attribute-Based Encryption (ABE)" />
            <Feature icon={<KeyRound className="h-6 w-6 text-indigo-400"/>} text="Robust User Access Control" />
            <Feature icon={<Users className="h-6 w-6 text-indigo-400"/>} text="Comprehensive Admin Management" />
          </ul>
        </motion.div>
        
        <Card className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
            <motion.div
                key={isLoginView ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        {isLoginView 
                            ? (isAdmin ? 'Admin Login' : 'User Login')
                            : 'Admin Registration'
                        }
                    </h2>
                    <p className="text-slate-400 mt-2">
                        {isLoginView
                          ? 'Securely access your dashboard.'
                          : 'Create your administrator account.'
                        }
                    </p>
                </div>

                {isLoginView ? renderLoginForm() : renderSignupForm()}

                <div className="mt-6 text-center text-sm text-slate-400">
                    {isLoginView ? (
                        isAdmin ? null : (
                            <>
                            Are you an admin?{' '}
                            <button onClick={() => setIsAdmin(true)} className="font-semibold text-indigo-400 hover:text-indigo-300">Login Here</button>
                            </>
                        )
                    ) : (
                        <>
                        Already have an admin account?{' '}
                        <button onClick={() => setIsLoginView(true)} className="font-semibold text-indigo-400 hover:text-indigo-300">Login</button>
                        </>
                    )}
                     {!isAdmin && isLoginView && (
                        <>
                            <br/>No admin account?{' '}
                            <button onClick={() => setIsLoginView(false)} className="font-semibold text-indigo-400 hover:text-indigo-300">Register</button>
                        </>
                    )}
                </div>
            </motion.div>
            </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;