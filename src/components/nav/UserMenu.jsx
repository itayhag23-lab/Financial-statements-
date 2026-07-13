import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Settings, Trash2 } from 'lucide-react';
import { FONTS, C } from '../../brand/theme';
import { useAuth, signOut } from '../../contexts/AuthContext';

export default function UserMenu({ onFeedbackClick, onDeleteAccount, canDelete }) {
  const navigate = useNavigate();
  const user = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const userInitial = user?.email?.[0]?.toUpperCase() || '?';
  const userEmail = user?.email || '';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && buttonRef.current && !menuRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleFeedback = () => {
    setOpen(false);
    onFeedbackClick?.();
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/auth', { replace: true });
  };

  const menuItems = [
    { label: userEmail, type: 'header', disabled: true },
    { separator: true },
    { icon: MessageSquare, label: 'Send feedback', action: handleFeedback },
    { icon: Trash2, label: 'Delete account', action: onDeleteAccount, variant: 'danger', hidden: !canDelete },
    { separator: true },
    { icon: LogOut, label: 'Sign out', action: handleSignOut },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: open ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
          border: `2px solid ${open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 700,
          color: '#10B981',
          transition: 'all 200ms ease',
          flexShrink: 0,
        }}
        title={userEmail}
      >
        {userInitial}
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12), 0 0 1px rgba(15, 23, 42, 0.08)',
            zIndex: 50,
            minWidth: 220,
            overflow: 'hidden',
            fontFamily: FONTS.body,
          }}
        >
          {menuItems.map((item, idx) => {
            if (item.hidden) return null;
            if (item.separator) {
              return (
                <div
                  key={`separator-${idx}`}
                  style={{ height: 1, background: C.border, margin: '4px 0' }}
                />
              );
            }
            if (item.type === 'header') {
              return (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: C.surfaceAlt,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.label}
                >
                  {item.label}
                </div>
              );
            }
            const Icon = item.icon;
            const isDanger = item.variant === 'danger';
            return (
              <button
                key={idx}
                onClick={item.action}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  color: isDanger ? C.rust : C.ink2,
                  transition: 'background 120ms ease',
                  ':hover': { background: isDanger ? 'rgba(220, 38, 38, 0.05)' : C.bgWarm },
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDanger ? 'rgba(220, 38, 38, 0.05)' : C.bgWarm;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
