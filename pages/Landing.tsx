
import React from 'react';

interface LandingProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Elevate Your <span className="text-indigo-600">Academic Journey</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl">
            A secure, structured platform connecting students with elite academic writers.
            Streamline submissions, track progress, and ensure excellence.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <button
              onClick={() => onNavigate('LOGIN')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Get Started
            </button>
            <button
              onClick={() => onNavigate('REGISTER')}
              className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <img
              src="https://picsum.photos/seed/edu/800/600"
              alt="Education"
              className="relative rounded-2xl shadow-2xl border border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Paperly?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure File Handling',
                desc: 'Top-tier encryption for your assignments and personal information.',
                icon: '🔒'
              },
              {
                title: 'Real-time Tracking',
                desc: 'Know exactly when your writer starts and completes your task.',
                icon: '⏳'
              },
              {
                title: 'AI Quality Assurance',
                desc: 'Integrated Gemini-powered review for structural integrity and quality.',
                icon: '🤖'
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
