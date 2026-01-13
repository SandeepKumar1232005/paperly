import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Star, MapPin, CheckCircle, Briefcase, ArrowLeft } from 'lucide-react';

interface WritersProps {
    onNavigate: (view: any) => void;
    onHire: (writerId: string) => void;
}

export function Writers({ onNavigate, onHire }: WritersProps) {
    const [writers, setWriters] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWriter, setSelectedWriter] = useState<User | null>(null);

    useEffect(() => {
        loadWriters();
    }, []);

    const loadWriters = async () => {
        try {
            const data = await api.getWriters();
            setWriters(data);
        } catch (error) {
            console.error('Failed to load writers', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="mb-8">
                    <button
                        onClick={() => onNavigate('DASHBOARD')}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Find a Writer</h1>
                    <p className="mt-2 text-gray-600">Browse our top-rated academic writers and choose the best fit for your assignment.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {writers.map((writer) => (
                            <div key={writer.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={writer.avatar}
                                                    alt={writer.name}
                                                    className="h-16 w-16 rounded-full bg-gray-100 object-cover"
                                                />
                                                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${writer.availability_status === 'ONLINE' ? 'bg-green-500' :
                                                    writer.availability_status === 'BUSY' ? 'bg-yellow-500' :
                                                        'bg-slate-400'
                                                    }`}></span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{writer.name}</h3>
                                                <div className="flex items-center text-sm text-yellow-500 mt-1">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <span className="ml-1 font-medium">4.9</span>
                                                    <span className="text-gray-400 ml-1">(120 reviews)</span>
                                                </div>
                                                <p className={`text-xs font-bold mt-1 ${writer.availability_status === 'ONLINE' ? 'text-green-600' :
                                                    writer.availability_status === 'BUSY' ? 'text-yellow-600' :
                                                        'text-slate-500'
                                                    }`}>
                                                    {writer.availability_status || 'ONLINE'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Briefcase className="h-4 w-4 mr-2" />
                                            <span>Academic Writer</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            <span>New York, USA</span>
                                        </div>
                                        <div className="flex items-center text-sm text-green-600">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            <span>98% Completion Rate</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => onHire(writer.id)}
                                                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                            >
                                                Hire Me
                                            </button>
                                            <button
                                                onClick={() => setSelectedWriter(writer)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Writer Profile Modal */}
            {selectedWriter && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="relative h-32 bg-indigo-600">
                            <button onClick={() => setSelectedWriter(null)} className="absolute top-4 right-4 text-white hover:text-indigo-100 text-3xl font-bold">&times;</button>
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="relative -mt-12 mb-4 flex justify-between items-end">
                                <img
                                    src={selectedWriter.avatar}
                                    alt={selectedWriter.name}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white"
                                />
                                <div className="mb-1 mr-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedWriter.availability_status === 'ONLINE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {selectedWriter.availability_status || 'ONLINE'}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900">{selectedWriter.name}</h2>
                            <p className="text-indigo-600 font-medium text-sm mb-4">Top Rated Writer</p>

                            <div className="flex items-center gap-1 mb-6 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-bold text-gray-900">4.9</span>
                                <span>(120 reviews)</span>
                                <span className="mx-2">•</span>
                                <span>New York, USA</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-2xl font-bold text-gray-900">98%</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-2xl font-bold text-gray-900">50+</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Projects Done</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Professional academic writer with over 5 years of experience in Thesis, Essay, and Research writing. Committed to delivering high-quality work on time.
                                        {/* Mock bio since we don't have bio in User model yet */}
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {['History', 'Literature', 'Psychology', 'Sociology'].map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-md border border-indigo-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        onHire(selectedWriter.id);
                                        setSelectedWriter(null);
                                    }}
                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                >
                                    Hire Now
                                </button>
                                <button
                                    onClick={() => setSelectedWriter(null)}
                                    className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
