
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, Assignment, AssignmentStatus, UserRole, ChatMessage, Notification } from './types';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import WriterDashboard from './pages/WriterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatWindow from './components/ChatWindow';
import { generateChatResponse } from './services/gemini';
import { api } from './services/api';
import { db } from './services/db';

import { Writers } from './pages/Writers';

type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER' | 'DASHBOARD' | 'FORGOT_PASSWORD' | 'WRITERS';

import { GoogleOAuthProvider } from '@react-oauth/google';

import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  console.log("Debug: VITE_GOOGLE_CLIENT_ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For Admin Dashboard
  const [view, setView] = useState<ViewState>('LANDING');
  const [activeChatAsgn, setActiveChatAsgn] = useState<Assignment | null>(null);
  const [chatCounterpart, setChatCounterpart] = useState<User | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [selectedWriterId, setSelectedWriterId] = useState<string | null>(null); // State to hold selected writer for assignment creation

  // Initialize data on mount or user change
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsSyncing(true);
      try {
        const promises: Promise<any>[] = [
          api.getAssignments(),
          api.getAllMessages(),
          api.getNotifications(user.id)
        ];

        if (user.role === 'ADMIN') {
          promises.push(api.getAllUsers());
        }

        const results = await Promise.all(promises);
        setAssignments(results[0]);
        setMessages(results[1]);
        setNotifications(results[2]);

        if (user.role === 'ADMIN') {
          setAllUsers(results[3]);
        }

      } catch (err) {
        console.error('Initial fetch failed', err);
      } finally {
        setIsSyncing(false);
      }
    };
    fetchData();
  }, [user]);

  // Heartbeat / Simulated presence
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      api.ping(user.id);

      // Also refresh the counterpart's status if chat is open
      if (activeChatAsgn) {
        const otherId = user.role === 'STUDENT'
          ? activeChatAsgn.writerId
          : activeChatAsgn.studentId;

        if (otherId) {
          api.getUser(otherId).then(setChatCounterpart);
        }
      }
    }, 15000); // 15s ping

    return () => clearInterval(interval);
  }, [user, activeChatAsgn]);

  const addNotification = useCallback(async (message: string) => {
    if (!user) return;
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    await api.addNotification(newNotif);
    setNotifications(prev => [newNotif, ...prev]);
  }, [user]);

  const unreadMsgCount = useMemo(() => {
    if (!user) return 0;
    return messages.filter(m => m.senderId !== user.id && !m.isRead).length;
  }, [messages, user]);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const handleLoginSubmit = async (email: string, password: string): Promise<void> => {
    setIsSyncing(true);
    try {
      const foundUser = await api.login(email, password);
      // Removed admin check to allow testing
      // if (email === 'charlie@admin.com' && password !== 'admin' && password !== 'password') {
      //   throw new Error('Invalid admin credentials');
      // }
      setUser(foundUser);
      setView('DASHBOARD');
      addNotification(`Welcome back, ${foundUser.name}!`);
    } catch (err: any) {
      throw new Error(err.message || 'Authentication failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSocialLoginSuccess = async (user: User): Promise<void> => {
    setUser(user);
    setView('DASHBOARD');
    addNotification(`Welcome back, ${user.name}!`);
  };

  const handleRegisterSubmit = async (name: string, email: string, username: string, password: string, role: UserRole): Promise<void> => {
    setIsSyncing(true);
    try {
      const newUser: User & { password?: string } = {
        id: `user-${Date.now()}`,
        name,
        email,
        username,
        role,
        password, // Pass to API
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };
      const registeredUser = await api.register(newUser);
      setUser(registeredUser);
      setView('DASHBOARD');
      addNotification(`Account created successfully! Welcome to Paperly.`);
    } catch (err: any) {
      console.error(err);
      throw err; // Re-throw to allow Register form to handle error
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateProfile = async (updatedUser: Partial<User>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const newUser = await api.updateUserById(user.id, updatedUser);
      setUser(newUser);
      await addNotification('Your profile has been updated successfully.');
    } catch (err) {
      console.error(err);
      await addNotification('Failed to update profile.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('LANDING');
    setActiveChatAsgn(null);
    setChatCounterpart(null);
    setIsOtherTyping(false);
    setChatError(null);
    setNotifications([]);
    setAssignments([]);
    setMessages([]);
  };

  const markNotificationsRead = useCallback(async () => {
    if (!user) return;
    await api.markNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, [user]);

  const handleSendMessage = useCallback(async (text: string, attachment?: ChatMessage['attachment'], replyTo?: ChatMessage['replyTo']) => {
    if (!user || !activeChatAsgn) return;
    setChatError(null);

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      assignmentId: activeChatAsgn.id,
      senderId: user.id,
      text,
      attachment,
      replyTo,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    await api.sendMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);

    // AI Simulation Response
    setTimeout(async () => {
      setIsOtherTyping(true);
      try {
        const prompt = replyTo
          ? `User just replied to a message ("${replyTo.text}") with: "${text || "Attachment shared."}". Respond specifically to their point.`
          : text || (attachment ? "File shared." : "Hi");

        const replyText = await generateChatResponse(
          activeChatAsgn.title,
          activeChatAsgn.subject,
          user.role,
          prompt
        );

        setIsOtherTyping(false);
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now()}-reply`,
          assignmentId: activeChatAsgn.id,
          senderId: user.role === 'STUDENT' ? (activeChatAsgn.writerId || '2') : activeChatAsgn.studentId,
          text: replyText,
          timestamp: new Date().toISOString(),
          isRead: false,
          replyTo: {
            id: newMessage.id,
            text: newMessage.text || "Shared an attachment",
            senderId: user.id
          }
        };

        await api.sendMessage(replyMsg);
        setMessages(prev => [...prev, replyMsg]);
        addNotification(`New message regarding "${activeChatAsgn.title}"`);
      } catch (err) {
        setIsOtherTyping(false);
        setChatError("AI connection lost.");
      }
    }, 1500);
  }, [user, activeChatAsgn, addNotification]);

  const handleOpenChat = useCallback(async (asgn: Assignment) => {
    setActiveChatAsgn(asgn);
    setChatError(null);

    // Fetch the status of the counterpart
    const otherId = user?.role === 'STUDENT' ? asgn.writerId : asgn.studentId;
    if (otherId) {
      const counterpart = await api.getUser(otherId);
      setChatCounterpart(counterpart);
    } else {
      setChatCounterpart(null);
    }

    setMessages(prev => prev.map(m =>
      (m.assignmentId === asgn.id && m.senderId !== user?.id) ? { ...m, isRead: true } : m
    ));
  }, [user]);

  const handleCreateAssignment = useCallback(async (data: Partial<Assignment>, file?: File) => {
    if (!user) return;
    setIsSyncing(true);
    const newAsgn: Assignment = {
      id: `asgn-${Date.now()}`,
      title: data.title || 'Untitled',
      description: data.description || '',
      subject: data.subject || 'General',
      budget: data.budget || 50,
      deadline: data.deadline || '',
      status: AssignmentStatus.PENDING,
      studentId: user.id,
      writerId: selectedWriterId || undefined, // Assign selected writer
      files: [],
      createdAt: new Date().toISOString(),
      paymentStatus: 'UNPAID',
    };

    if (selectedWriterId) {
      newAsgn.status = AssignmentStatus.PENDING_REVIEW; // Or WAITING_ACCEPTANCE if that status existed. PENDING_REVIEW is close enough for MVP.
    }

    await api.createAssignment(newAsgn, file);
    setAssignments(prev => [newAsgn, ...prev]);
    await addNotification(`Task "${newAsgn.title}" is now live${selectedWriterId ? ' and assigned' : ''}.`);
    setIsSyncing(false);
    setSelectedWriterId(null); // Reset selection
  }, [user, addNotification, selectedWriterId]);

  const handleUpdateAssignment = useCallback(async (id: string, updates: Partial<Assignment>) => {
    setIsSyncing(true);
    try {
      // If status is being updated to assigned, include writerId if not present
      const payload = { ...updates };
      if (updates.status === AssignmentStatus.ASSIGNED || updates.status === AssignmentStatus.IN_PROGRESS) {
        if (!payload.writerId) payload.writerId = user?.id; // Auto-assign if taking task
      }

      const updated = await api.updateAssignment(id, payload);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));

      if (updates.status) {
        await addNotification(`Project status updated to ${updates.status.replace('_', ' ')}.`);
      } else if (updates.budget) {
        await addNotification(`Project budget updated to ₹${updates.budget}.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [user, addNotification]);

  const handleUploadSubmission = useCallback(async (id: string, text: string) => {
    setIsSyncing(true);
    try {
      const updated = await api.updateAssignment(id, {
        status: AssignmentStatus.COMPLETED,
        submission: text
      });
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      await addNotification(`Project submitted! Your work is now ready for review.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [addNotification]);



  // Writer Negotiation Handlers
  const handleSubmitQuote = useCallback(async (id: string, amount: number, comment: string, writerId: string) => {
    setIsSyncing(true);
    try {
      const updated = await api.submitQuote(id, amount, comment, writerId);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      await addNotification('Quote submitted to student successfully.');
    } catch (err: any) {
      console.error(err);
      await addNotification('Failed to submit quote: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [addNotification]);

  const handleRespondToQuote = useCallback(async (id: string, action: 'ACCEPT' | 'REJECT') => {
    setIsSyncing(true);
    try {
      const updated = await api.respondToQuote(id, action);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      if (action === 'ACCEPT') {
        await addNotification(`Quote accepted! Please proceed to payment to start the project.`);
      } else {
        await addNotification(`Quote rejected. Assignment is back to review.`);
      }
    } catch (err: any) {
      console.error(err);
      await addNotification('Failed to respond to quote: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [addNotification]);


  const handleRejectAssignment = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to drop this assignment? This will impact your reliability score.")) return;
    setIsSyncing(true);
    try {
      const updated = await api.rejectAssignment(id);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      await addNotification('Assignment dropped successfully.');
    } catch (err: any) {
      console.error(err);
      await addNotification('Failed to drop assignment: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [addNotification]);

  const handleDeleteAssignment = useCallback(async (id: string) => {
    // Confirmation handled in UI
    setIsSyncing(true);
    try {
      await api.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      await addNotification('Assignment deleted successfully.');
    } catch (err: any) {
      console.error(err);
      await addNotification('Failed to delete assignment: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [addNotification]);

  const handleHireWriter = (writerId: string) => {
    setSelectedWriterId(writerId);
    setView('DASHBOARD'); // Go back to dashboard to open create modal
    // We need a way to trigger open modal. 
    // For now, simpler optimization: 
    // Change 'DASHBOARD' to automatically open modal if selectedWriterId is set?
    // Or pass selectedWriterId to StudentDashboard and let it handle opening.
  };

  const handleUpdateStatus = useCallback(async (id: string, status: AssignmentStatus, feedback?: string) => {
    setIsSyncing(true);
    try {
      const current = assignments.find(a => a.id === id);
      const payload: Partial<Assignment> = { status };

      if (status === AssignmentStatus.REVISION && current) {
        payload.revision_count = (current.revision_count || 0) + 1;
        // payload.feedback = feedback; // Optionally separate feedback field
        // For now, we assume feedback might be handled via chat or separate field if 'feedback' exists on model
      }

      const updated = await api.updateAssignment(id, payload);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));

      if (status === AssignmentStatus.COMPLETED) {
        await addNotification('Assignment marked as completed. Payment released.');
      } else if (status === AssignmentStatus.REVISION) {
        await addNotification('Revision requested.');
      }
    } catch (err) {
      console.error(err);
      await addNotification('Failed to update status.');
    } finally {
      setIsSyncing(false);
    }
  }, [assignments, addNotification]);

  const renderView = () => {
    switch (view) {
      case 'LANDING':
        return <Landing onNavigate={setView} />;
      case 'LOGIN':
        return <Login onLogin={handleLoginSubmit} onSocialLoginSuccess={handleSocialLoginSuccess} onNavigate={setView} />;
      case 'REGISTER':
        return <Register onRegister={handleRegisterSubmit} onSocialLoginSuccess={handleSocialLoginSuccess} onNavigate={setView} />;
      case 'FORGOT_PASSWORD':
        return <ForgotPassword onNavigate={(view) => setView(view as any)} />;
      case 'WRITERS':
        if (!user) return <Login onLogin={handleLoginSubmit} onNavigate={setView} />; // Protect route
        return <Writers onNavigate={setView} onHire={handleHireWriter} />;
      case 'DASHBOARD':
        if (!user) return <Landing onNavigate={setView} />;
        if (user.role === 'STUDENT') return <StudentDashboard user={user} assignments={assignments.filter(a => a.studentId === user.id)} onCreateAssignment={handleCreateAssignment} onRespondToQuote={handleRespondToQuote} onOpenChat={handleOpenChat} onDeleteAssignment={handleDeleteAssignment} onNavigate={setView} preSelectedWriterId={selectedWriterId} onUpdateStatus={handleUpdateStatus} />;
        if (user.role === 'WRITER') return <WriterDashboard user={user} assignments={assignments} onSubmitQuote={handleSubmitQuote} onUpdateAssignment={handleUpdateAssignment} onUploadSubmission={handleUploadSubmission} onOpenChat={handleOpenChat} onUpdateProfile={handleUpdateProfile} onRejectAssignment={handleRejectAssignment} />;
        if (user.role === 'ADMIN') return <AdminDashboard user={user} assignments={assignments} users={allUsers} />;
        return null;
      default:
        return <Landing onNavigate={setView} />;
    }
  };

  return (
    <Layout
      user={user}
      unreadCount={unreadMsgCount + unreadNotifCount}
      notifications={notifications}
      onLogout={handleLogout}
      onMarkRead={markNotificationsRead}
      onUpdateProfile={handleUpdateProfile}
      onNavigate={(view) => setView(view as any)}
    >
      {isSyncing && (
        <div className="fixed top-20 right-4 z-[9999] animate-in fade-in slide-in-from-right-4">
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20">
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Saving to Cloud...</span>
          </div>
        </div>
      )}

      {renderView()}

      {activeChatAsgn && user && (
        <ChatWindow
          currentUser={user}
          otherUser={chatCounterpart}
          assignment={activeChatAsgn}
          messages={messages.filter(m => m.assignmentId === activeChatAsgn.id)}
          isOtherTyping={isOtherTyping}
          error={chatError}
          onSendMessage={handleSendMessage}
          onUserTyping={() => { }}
          onClose={() => { setActiveChatAsgn(null); setChatCounterpart(null); }}
        />
      )}
    </Layout>

  );
};

export default App;
