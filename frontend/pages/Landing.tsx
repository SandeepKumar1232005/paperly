import React, { useState, useEffect } from 'react';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';

const heroImages = [hero1, hero2, hero3, hero4, hero5];

interface LandingProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 2000); // Change every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans min-h-screen transition-colors duration-300">

      {/* Background Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-blob animation-delay-2000"></div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-32 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-semibold text-sm shadow-sm border border-indigo-200 dark:border-indigo-800">
            Study Smarter, Not Harder ⭐
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
            Think Smart!<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Submit Better..
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Connect with top-tier writers, manage assignments effortlessly, and achieve the grades you deserve with Paperly's secure platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button
              onClick={() => onNavigate('LOGIN')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1"
            >
              Get Started Now
            </button>
            <button
              onClick={() => onNavigate('REGISTER')}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
            >
              Create Account
            </button>
          </div>


        </div>

        <div className="flex-1 w-full max-w-xl lg:max-w-none z-10 perspective-1000">
          <div className="relative group hover:rotate-1 transition-transform duration-500 ease-out h-[400px] w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>


            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              {heroImages.map((img, index) => (
                <img
                  key={img}
                  src={img}
                  alt="Education"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${index === currentImageIndex
                    ? 'opacity-100 scale-105'
                    : 'opacity-0 scale-100'
                    }`}
                />
              ))}
            </div>


          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-white dark:bg-slate-900 py-24 border-y border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">How Paperly Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">From request to submission, we make the process unified and stress-free.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 -z-10"></div>

            {[
              { step: '01', title: 'Post Request', desc: 'Detail your assignment requirements and set your deadline.' },
              { step: '02', title: 'Connect', desc: 'Get matched with expert writers and approve the best quote.' },
              { step: '03', title: 'Succeed', desc: 'Receive your high-quality paper, review it, and pay securely.' }
            ].map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 border-4 border-indigo-50 dark:border-indigo-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{s.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed px-4">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Writers Section */}
      <div id="writers" className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Meet Our Top Experts</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Our vetted writers from top universities are ready to help you excel.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all text-center">
                <div className="w-20 h-20 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="Writer" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Dr. Alex {String.fromCharCode(64 + i)}.</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mb-2">PhD in Literature</p>
                <div className="flex justify-center gap-1 text-amber-400 text-sm mb-3">★★★★★</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">"Specialist in academic essays and thesis writing."</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Student Success Stories</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", uni: "Stanford", text: "Paperly saved my semester! The writer understood my prompt perfectly." },
              { name: "Michael T.", uni: "MIT", text: "Incredible quality and fast delivery. The AI checks gave me extra peace of mind." },
              { name: "Emily R.", uni: "Oxford", text: "The process is so smooth. Budget-friendly and professional." }
            ].map((r, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 italic relative">
                <span className="text-6xl text-indigo-200 dark:text-indigo-900 absolute top-4 left-4 font-serif">"</span>
                <p className="text-slate-700 dark:text-slate-300 mb-6 relative z-10">{r.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">{r.name[0]}</div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.uni}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Frequent Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is using Paperly anonymous?", a: "Yes, your identity is protected. Writers only see your Client ID." },
              { q: "How do payments work?", a: "We hold funds securely in escrow until you approve the final submission." },
              { q: "Can I choose my writer?", a: "Absolutely. You can review bids and profiles before assigning your task." }
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Why Choose Us?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure File Handling',
                desc: 'Top-tier encryption for your assignments and personal information.',
                icon: '🔒',
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: 'Real-time Tracking',
                desc: 'Know exactly when your writer starts and completes your task.',
                icon: '⏳',
                color: 'bg-amber-50 text-amber-600'
              },
              {
                title: 'AI Quality Assurance',
                desc: 'Integrated Gemini-powered review for structural integrity and quality.',
                icon: '🤖',
                color: 'bg-purple-50 text-purple-600'
              }
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default">
                <div className={`w-14 h-14 ${f.color} dark:bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 relative z-10">Ready to Excel?</h2>
          <p className="text-indigo-100 text-lg lg:text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of students who trust Paperly for their academic success.
          </p>
          <button
            onClick={() => onNavigate('REGISTER')}
            className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:scale-105 relative z-10"
          >
            Start Your Journey
          </button>
        </div>
      </div>

    </div>
  );
};

export default Landing;
