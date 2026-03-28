import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { demoUser } from '../services/demoData';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAndSetRole = async (authUser) => {
        // Always prefer the profiles table as source of truth (matches RLS policies)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_approved')
            .eq('id', authUser.id)
            .maybeSingle();
        setUserRole(profile?.role || authUser.user_metadata?.role || 'admin');
    };

    useEffect(() => {
        if (isSupabaseConfigured()) {
            // Get initial session
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                if (session?.user) {
                    // Check approval status before setting user
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, is_approved')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profile && !profile.is_approved) {
                        // User is not approved, sign them out
                        await supabase.auth.signOut();
                        setUser(null);
                        setUserRole(null);
                    } else {
                        setUser(session.user);
                        setUserRole(profile?.role || session.user.user_metadata?.role || 'admin');
                    }
                }
                setLoading(false);
            });

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    fetchAndSetRole(session.user);
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

            // Check if user is approved
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, is_approved')
                .eq('id', data.user.id)
                .maybeSingle();

            if (profile && !profile.is_approved) {
                // Sign them out immediately
                await supabase.auth.signOut();
                throw new Error('Your account is pending admin approval. Please wait for an admin to approve your account.');
            }

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

            // Explicitly create the profile row (trigger may fail silently)
            if (data?.user?.id) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        full_name: fullName,
                        role: role,
                        is_approved: false,
                    }, { onConflict: 'id' });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }
            }

            // Sign out immediately — user must wait for admin approval
            await supabase.auth.signOut();

            return data;
        } else {
            // Demo mode — just show success
            return { user: { email, user_metadata: { full_name: fullName, role } } };
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
