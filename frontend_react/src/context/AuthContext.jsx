import React, { createContext, useContext, useState, useEffect } from 'react';

const ROLES = {
  coder: {
    id: 'usr-coder-01',
    role: 'coder',
    name: 'Alex Chen',
    roleName: 'Coder / Engineering Lead',
    email: 'alex.chen@linear.app',
    title: 'Lead Staff Software Engineer',
    team: 'Core Engineering & AI Infrastructure',
    avatarText: 'AC',
    badge: 'Coder',
    icon: 'code',
    accentColor: '#3ee6aa',
    description: 'Updates Vectorize Hindsight memory with newly shipped features, PR merges, and codebase optimizations.',
    permissions: [
      'retain_memory',
      'ingest_features',
      'dev_copilot',
      'inspect_memory',
      'view_code_changelog',
      'manage_prs'
    ]
  },
  marketing: {
    id: 'usr-mkt-01',
    role: 'marketing',
    name: 'Sarah Jenkins',
    roleName: 'Marketing Team / Growth Lead',
    email: 'sarah.jenkins@linear.app',
    title: 'Head of GEO & Organic Growth',
    team: 'Growth Strategy & Market Intelligence',
    avatarText: 'SJ',
    badge: 'Marketing Team',
    icon: 'megaphone',
    accentColor: '#5e6ad2',
    description: 'Monitors citation drops, tracks Jira competitor moves, and formulates GEO strategies using coder-retained memories.',
    permissions: [
      'view_analytics',
      'marketing_copilot',
      'citation_probe',
      'competitor_radar',
      'export_reports',
      'reflect_strategy'
    ]
  }
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem('crystalcore_auth_role');
    return saved === 'marketing' ? 'marketing' : 'coder';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const currentUser = ROLES[currentRole] || ROLES.coder;

  useEffect(() => {
    localStorage.setItem('crystalcore_auth_role', currentRole);
  }, [currentRole]);

  const switchRole = (newRole) => {
    if (ROLES[newRole]) {
      setCurrentRole(newRole);
      return ROLES[newRole];
    }
    return currentUser;
  };

  const toggleRole = () => {
    const nextRole = currentRole === 'coder' ? 'marketing' : 'coder';
    return switchRole(nextRole);
  };

  const login = (role) => {
    switchRole(role);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    // Reset to coder as default
    setCurrentRole('coder');
  };

  const value = {
    user: currentUser,
    currentRole,
    roles: ROLES,
    isCoder: currentRole === 'coder',
    isMarketing: currentRole === 'marketing',
    switchRole,
    toggleRole,
    login,
    logout,
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
