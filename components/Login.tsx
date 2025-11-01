
import React, { useState, useEffect } from 'react';
import { LoginProvider, Page } from '../types';
import { countryCodes } from './countryCodes';

interface LoginProps {
  onLogin: (name?: string, email?: string) => void;
  provider: LoginProvider | null;
  setActivePage: (page: Page) => void;
}

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-6 left-6 p-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-colors z-10"
        aria-label="Go back"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    </button>
);

const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

const OtpToast: React.FC<{ otp: string; onClose: () => void }> = ({ otp, onClose }) => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[100] animate-fade-in-up">
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-2xl p-4 flex items-start space-x-3 border dark:border-gray-600">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm text-gray-800 dark:text-gray-100">New Message from Ledgerly</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Your verification code is: <span className="font-bold tracking-wider">{otp}</span></p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    </div>
);

const CountryCodeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (dialCode: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredCountries = countryCodes.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dial_code.includes(searchTerm)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm h-[80vh] flex flex-col mx-4">
                <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Select Country</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </header>
                <div className="p-4 flex-shrink-0">
                     <input
                        type="search"
                        placeholder="Search for a country"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                        autoFocus
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredCountries.map(country => (
                        <button
                            key={country.code}
                            onClick={() => onSelect(country.dial_code)}
                            className="w-full flex items-center p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <span className="text-2xl mr-4">{getFlagEmoji(country.code)}</span>
                            <span className="flex-grow text-gray-800 dark:text-gray-100">{country.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{country.dial_code}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MobileLogin: React.FC<{
    onLogin: (name?: string, email?: string) => void;
    setActivePage: (page: Page) => void;
}> = ({ onLogin, setActivePage }) => {
    const [step, setStep] = useState<'number' | 'otp'>('number');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [mobileNumberError, setMobileNumberError] = useState('');
    const [showOtpToast, setShowOtpToast] = useState<string | null>(null);
    
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);
    
    useEffect(() => {
        if (showOtpToast) {
            const timer = setTimeout(() => setShowOtpToast(null), 6000); // Show for 6 seconds
            return () => clearTimeout(timer);
        }
    }, [showOtpToast]);

    const handleGetOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (mobileNumber.length >= 7 && mobileNumber.length <= 15 && /^\d+$/.test(mobileNumber)) {
            setMobileNumberError('');
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            setShowOtpToast(newOtp);
            setStep('otp');
            setCountdown(30);
            setOtp('');
            setOtpError('');
        } else {
            setMobileNumberError('Please enter a valid mobile number (7-15 digits).');
        }
    };
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === generatedOtp) {
            onLogin(`User ${mobileNumber.slice(-4)}`);
        } else {
            setOtpError('Invalid OTP. Please try again.');
            setOtp('');
        }
    };

    const handleResendOtp = () => {
        if (countdown > 0) return;
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setShowOtpToast(newOtp);
        setCountdown(30);
        setOtp('');
        setOtpError('');
    };
    
    const handleSelectCountry = (dialCode: string) => {
        setCountryCode(dialCode);
        setIsCountryModalOpen(false);
    };

    return (
        <>
            {showOtpToast && <OtpToast otp={showOtpToast} onClose={() => setShowOtpToast(null)} />}
            <CountryCodeModal
                isOpen={isCountryModalOpen}
                onClose={() => setIsCountryModalOpen(false)}
                onSelect={handleSelectCountry}
            />
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4 relative">
                <BackButton onClick={() => step === 'otp' ? setStep('number') : setActivePage(Page.SETTINGS)} />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {step === 'number' ? 'Enter your mobile number' : 'Enter OTP'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                            {step === 'number' ? 'We will send you a confirmation code.' : `We've sent a 6-digit code to ${countryCode} ${mobileNumber}.`}
                        </p>
                    </div>
                    {step === 'number' ? (
                        <form className="space-y-4" onSubmit={handleGetOtp}>
                            <div>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsCountryModalOpen(true)}
                                        className={`flex items-center px-4 py-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none ${
                                            mobileNumberError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    >
                                        <span>{countryCode}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-2 text-gray-400 transition-transform duration-200 ${isCountryModalOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </button>
                                    <input 
                                        type="tel" 
                                        placeholder="Mobile number" 
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            setMobileNumber(e.target.value.replace(/\D/g, ''));
                                            if (mobileNumberError) setMobileNumberError('');
                                        }}
                                        className={`w-full px-4 py-3 border rounded-r-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                                            mobileNumberError
                                            ? 'border-red-500 ring-red-500'
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-violet-500'
                                        }`} 
                                        required 
                                        maxLength={15}
                                    />
                                </div>
                                {mobileNumberError && <p className="text-red-500 text-sm text-center mt-2">{mobileNumberError}</p>}
                            </div>
                            <button type="submit" className="w-full py-3 rounded-lg text-white font-bold text-lg transition-colors bg-violet-600 hover:bg-violet-700">
                                Get OTP
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleLogin}>
                            <input 
                                type="text" 
                                placeholder="_ _ _ _ _ _" 
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, ''));
                                    if(otpError) setOtpError('');
                                }}
                                className={`w-full px-4 py-3 text-center tracking-[0.5em] border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                                    otpError
                                    ? 'border-red-500 ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-violet-500'
                                }`}
                                required 
                                maxLength={6}
                                autoFocus
                            />
                            {otpError && <p className="text-red-500 text-sm text-center">{otpError}</p>}
                            <button type="submit" className="w-full py-3 rounded-lg text-white font-bold text-lg transition-colors bg-violet-600 hover:bg-violet-700">
                                Log In
                            </button>
                            <div className="text-center">
                                <button 
                                  type="button" 
                                  onClick={handleResendOtp}
                                  disabled={countdown > 0}
                                  className="text-sm text-gray-500 dark:text-gray-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};


const EmailLogin: React.FC<{
    onLogin: (name?: string, email?: string) => void;
    setActivePage: (page: Page) => void;
}> = ({ onLogin, setActivePage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4 relative">
            <BackButton onClick={() => setActivePage(Page.SETTINGS)} />
            <div className="w-full max-w-sm">
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full">
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(email.split('@')[0], email); }}>
                        <input 
                            type="email" 
                            placeholder="Email or phone number" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                            required 
                        />
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            minLength={6}
                            required
                        />
                         <div className="flex items-center">
                            <input
                            id="show-password-alt"
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="show-password-alt" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Show password
                            </label>
                        </div>
                        <button type="submit" className="w-full py-3 rounded-lg text-white font-bold text-lg transition-colors bg-blue-600 hover:bg-blue-700">
                            Log In
                        </button>
                    </form>
                     <div className="text-center my-4">
                        <button 
                            type="button"
                            onClick={() => setActivePage(Page.FORGOT_PASSWORD)}
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 text-center">
                        <button
                            onClick={() => setActivePage(Page.SIGNUP)}
                            className="py-3 px-6 font-bold rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white"
                        >
                            Create new account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Login: React.FC<LoginProps> = ({ onLogin, provider, setActivePage }) => {
  useEffect(() => {
    if (provider === 'google') {
      // Simulate an automatic, successful Google login
      onLogin('John Doe', 'john.doe@gmail.com');
    }
  }, [provider, onLogin]);

  switch (provider) {
    case 'google':
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-4">
             <svg className="animate-spin h-10 w-10 text-violet-600 dark:text-violet-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Signing in securely with Google...</p>
          </div>
        </div>
      );
    case 'mobile':
      return <MobileLogin onLogin={onLogin} setActivePage={setActivePage} />;
    case 'email':
      return <EmailLogin onLogin={onLogin} setActivePage={setActivePage} />;
    default:
      // Fallback or loading state
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      );
  }
};

export default Login;
