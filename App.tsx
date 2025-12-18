
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, Assignment, AssignmentStatus, UserRole, ChatMessage, Notification } from './types';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import WriterDashboard from './pages/WriterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatWindow from './components/ChatWindow';
import { generateChatResponse } from './services/gemini';
import { api } from './services/api';
import { db } from './services/db';

type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER' | 'DASHBOARD';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [view, setView] = useState<ViewState>('LANDING');
  const [activeChatAsgn, setActiveChatAsgn] = useState<Assignment | null>(null);
  const [chatCounterpart, setChatCounterpart] = useState<User | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // Initialize data on mount or user change
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsSyncing(true);
      try {
        const [asgns, msgs, notifs] = await Promise.all([
          api.getAssignments(),
          api.getAllMessages(),
          api.getNotifications(user.id)
        ]);
        setAssignments(asgns);
        setMessages(msgs);
        setNotifications(notifs);
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
      const foundUser = await api.login(email);
      if (email === 'charlie@admin.com' && password !== 'admin' && password !== 'password') {
        throw new Error('Invalid admin credentials');
      }
      setUser(foundUser);
      setView('DASHBOARD');
      addNotification(`Welcome back, ${foundUser.name}!`);
    } catch (err: any) {
      throw new Error(err.message || 'Authentication failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRegisterSubmit = async (name: string, email: string, role: UserRole): Promise<void> => {
    setIsSyncing(true);
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };
      const registeredUser = await api.register(newUser);
      setUser(registeredUser);
      setView('DASHBOARD');
      addNotification(`Account created successfully! Welcome to Paperly.`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateProfile = async (updatedUser: Partial<User>) => {
    if (!user) return;
    setIsSyncing(true);
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    const allUsers = db.getUsers().map(u => u.id === user.id ? newUser : u);
    localStorage.setItem('paperly_users', JSON.stringify(allUsers));
    await addNotification('Your profile has been updated successfully.');
    setIsSyncing(false);
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

  const handleCreateAssignment = useCallback(async (data: Partial<Assignment>) => {
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
      files: [],
      createdAt: new Date().toISOString(),
      paymentStatus: 'UNPAID',
    };
    
    await api.createAssignment(newAsgn);
    setAssignments(prev => [newAsgn, ...prev]);
    await addNotification(`Task "${newAsgn.title}" is now live in the marketplace.`);
    setIsSyncing(false);
  }, [user, addNotification]);

  const handleUpdateStatus = useCallback(async (id: string, status: AssignmentStatus) => {
    setIsSyncing(true);
    try {
      const updated = await api.updateAssignment(id, { status, writerId: user?.id });
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      await addNotification(`Project status updated to ${status.replace('_', ' ')}.`);
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

  const renderView = () => {
    switch (view) {
      case 'LANDING':
        return <Landing onNavigate={setView} />;
      case 'LOGIN':
        return <Login onLogin={handleLoginSubmit} onNavigate={setView} />;
      case 'REGISTER':
        return <Register onRegister={handleRegisterSubmit} onNavigate={setView} />;
      case 'DASHBOARD':
        if (!user) return <Landing onNavigate={setView} />;
        if (user.role === 'STUDENT') return <StudentDashboard user={user} assignments={assignments.filter(a => a.studentId === user.id)} onCreateAssignment={handleCreateAssignment} onOpenChat={handleOpenChat} />;
        if (user.role === 'WRITER') return <WriterDashboard user={user} assignments={assignments} onUpdateStatus={handleUpdateStatus} onUploadSubmission={handleUploadSubmission} onOpenChat={handleOpenChat} />;
        if (user.role === 'ADMIN') return <AdminDashboard user={user} assignments={assignments} users={db.getUsers()} />;
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
          onUserTyping={() => {}}
          onClose={() => { setActiveChatAsgn(null); setChatCounterpart(null); }}
        />
      )}
    </Layout>
  );
};

export default App;
