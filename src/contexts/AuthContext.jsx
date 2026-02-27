import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { demoUser } from '../services/demoData';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isSupabaseConfigured()) {
            // Get initial session
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    setUser(session.user);
                    setUserRole(session.user.user_metadata?.role || 'admin');
                }
                setLoading(false);
            });

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    setUserRole(session.user.user_metadata?.role || 'admin');
                } else {
                    setUser(null);
                    setUserRole(null);
                }
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            // Demo mode: check localStorage
            const savedUser = localStorage.getItem('csms_demo_user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                setUserRole(parsed.user_metadata?.role || 'admin');
            }
            setLoading(false);
        }
    }, []);

    const login = async (email, password, role) => {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        } else {
            // Demo login
            const user = {
                ...demoUser,
                email,
                user_metadata: { ...demoUser.user_metadata, role: role || 'admin' },
            };
            localStorage.setItem('csms_demo_user', JSON.stringify(user));
            setUser(user);
            setUserRole(role || 'admin');
            return { user };
        }
    };

    const register = async (email, password, fullName, role) => {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, role },
                },
            });
            if (error) throw error;
            return data;
        } else {
            const user = {
                ...demoUser,
                email,
                user_metadata: { full_name: fullName, role },
            };
            localStorage.setItem('csms_demo_user', JSON.stringify(user));
            setUser(user);
            setUserRole(role);
            return { user };
        }
    };

    const logout = async () => {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('csms_demo_user');
        setUser(null);
        setUserRole(null);
    };

    const resetPassword = async (email) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
        }
    };

    const value = {
        user,
        userRole,
        loading,
        login,
        register,
        logout,
        resetPassword,
        isDemo: !isSupabaseConfigured(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
