// import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import * as SecureStore from "expo-secure-store";
// import api from "@/services/api";

// interface AuthUser {
//   constituentId: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   emailId: number;
//   phone: string;
//   phoneId: number;
//   addressId: number;
//   cartId?: string;   // ⭐ ADDED (shared Tessitura cart)

//   address: {
//     street1: string;
//     city: string;
//     province: string;
//     postalCode: string;
//     country: string;
//   };
// }

// interface AuthContextType {
//   user: AuthUser | null;
//   token: string | null;
//   loading: boolean;

//   signIn: (email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
//   signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Load saved token & user at startup
//   useEffect(() => {
//     (async () => {
//       const savedToken = await SecureStore.getItemAsync("token");
//       const savedUser = await SecureStore.getItemAsync("user");

//       if (savedToken && savedUser) {
//         setToken(savedToken);
//         setUser(JSON.parse(savedUser));
//       }

//       setLoading(false);
//     })();
//   }, []);

//   // =====================================================
//   // ⭐ UPDATED SIGN IN (login → profile → ensure cart)
//   // =====================================================
//   const signIn = async (email: string, password: string) => {
//     try {
//       setLoading(true);

//       // 1️⃣ LOGIN
//       const res = await api.post("/api/auth/login", { email, password });

//       if (!res.data.success) {
//         return { success: false, msg: res.data.msg || "Invalid login" };
//       }

//       const token = res.data.token;

//       // 👉 Save token
//       await SecureStore.setItemAsync("token", token);

//       // 2️⃣ LOAD PROFILE (/auth/me)
//       const profile = await api.get("/api/auth/me", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const fullUser: AuthUser = profile.data.user;

//       // Save temporarily (without cart yet)
//       await SecureStore.setItemAsync("user", JSON.stringify(fullUser));
//       setUser(fullUser);
//       setToken(token);

//       // 3️⃣ ENSURE SHARED CART SESSION (Option A)
//       const cartRes = await api.get("/api/cart/ensure", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (cartRes.data && cartRes.data.cartId) {
//         const userWithCart = {
//           ...fullUser,
//           cartId: cartRes.data.cartId,
//         };

//         // save new cart-enabled user object
//         await SecureStore.setItemAsync("user", JSON.stringify(userWithCart));
//         setUser(userWithCart);
//       }

//       return { success: true };

//     } catch (err: any) {
//       console.log("LOGIN ERROR:", err.response?.data || err.message);
//       return { success: false, msg: "Server error" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // SIGN UP (unchanged)
//   const signUp = async (firstName: string, lastName: string, email: string, password: string) => {
//     try {
//       setLoading(true);

//       const res = await api.post("/api/auth/register", {
//         firstName,
//         lastName,
//         email,
//         password,
//       });

//       if (!res.data.success) {
//         return { success: false, msg: "Registration failed" };
//       }

//       return { success: true };
//     } catch (err: any) {
//       console.log("REGISTER ERROR:", err.response?.data || err.message);
//       return { success: false, msg: "Server error" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // SIGN OUT
//   const signOut = async () => {
//     setUser(null);
//     setToken(null);

//     await SecureStore.deleteItemAsync("token");
//     await SecureStore.deleteItemAsync("user");
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         signIn,
//         signUp,
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be inside AuthProvider");
//   return ctx;
// }
















import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import api from "@/services/api";

// --------------------------------------------------
// AUTH USER (Tessitura Profile)
// --------------------------------------------------
interface AuthUser {
  constituentId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  emailId: number;
  phone: string;
  phoneId: number;
  addressId: number;
  address: {
    street1: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

// --------------------------------------------------
// AUTH CONTEXT SHAPE
// --------------------------------------------------
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; msg?: string }>;

  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; msg?: string }>;

  signOut: () => Promise<void>;

  sendResetEmail: (
    email: string
  ) => Promise<{ success: boolean; msg?: string }>;

  resetPassword: (
    email: string,
    token: string,
    newPassword: string
  ) => Promise<{ success: boolean; msg?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --------------------------------------------------
// PROVIDER
// --------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved user and token
  useEffect(() => {
    (async () => {
      const savedToken = await SecureStore.getItemAsync("token");
      const savedUser = await SecureStore.getItemAsync("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }

      setLoading(false);
    })();
  }, []);

  // --------------------------------------------------
  // SIGN IN WITH TESSITURA BACKEND
  // --------------------------------------------------
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", { email, password });
      if (!res.data.success) return { success: false, msg: res.data.msg };

      const token = res.data.token;

      await SecureStore.setItemAsync("token", token);
      setToken(token);

      const profile = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fullUser = profile.data.user;
      await SecureStore.setItemAsync("user", JSON.stringify(fullUser));
      setUser(fullUser);

      return { success: true };

    } catch (err: any) {
      return { success: false, msg: "Server error" };
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------
  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);

      const res = await api.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });

      return res.data;
    } catch (err) {
      return { success: false, msg: "Server error" };
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SEND RESET EMAIL (Tessitura)
  // --------------------------------------------------
  const sendResetEmail = async (email: string) => {
    try {
      setLoading(true);
      const res = await api.post("/api/auth/forgot-password", { email });
      return res.data;
    } catch (err) {
      return { success: false, msg: "Server error" };
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // RESET PASSWORD (Tessitura token + new password)
  // --------------------------------------------------
  const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {
      setLoading(true);
      const res = await api.post("/api/auth/reset-password", {
        email,
        token,
        newPassword,
      });
      return res.data;
    } catch (err) {
      return { success: false, msg: "Server error" };
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SIGN OUT
  // --------------------------------------------------
  const signOut = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        sendResetEmail,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// HOOK
// --------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}















// import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import * as SecureStore from "expo-secure-store";
// import api from "@/services/api";

// // --------------------------------------------------
// // AUTH USER (Tessitura Profile)
// // --------------------------------------------------
// interface AuthUser {
//   constituentId: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   emailId: number;
//   phone: string;
//   phoneId: number;
//   addressId: number;
//   address: {
//     street1: string;
//     city: string;
//     province: string;
//     postalCode: string;
//     country: string;
//   };
// }

// // --------------------------------------------------
// // AUTH CONTEXT TYPE
// // --------------------------------------------------
// interface AuthContextType {
//   user: AuthUser | null;
//   token: string | null;
//   loading: boolean;

//   signIn: (
//     email: string,
//     password: string
//   ) => Promise<{ success: boolean; msg?: string }>;

//   signUp: (
//     firstName: string,
//     lastName: string,
//     email: string,
//     password: string
//   ) => Promise<{ success: boolean; msg?: string }>;

//   signOut: () => Promise<void>;

//   resetPassword: (
//     email: string,
//     token: string,
//     newPassword: string
//   ) => Promise<{ success: boolean; msg?: string }>;
// }

// // --------------------------------------------------
// // CONTEXT INIT
// // --------------------------------------------------
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // --------------------------------------------------
// // PROVIDER
// // --------------------------------------------------
// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Load saved user + token on app start
//   useEffect(() => {
//     (async () => {
//       const savedToken = await SecureStore.getItemAsync("token");
//       const savedUser = await SecureStore.getItemAsync("user");

//       if (savedToken && savedUser) {
//         setToken(savedToken);
//         setUser(JSON.parse(savedUser));
//       }

//       setLoading(false);
//     })();
//   }, []);

//   // --------------------------------------------------
//   // SIGN IN
//   // --------------------------------------------------
//   const signIn = async (email: string, password: string) => {
//     try {
//       setLoading(true);

//       // Backend → login with Tessitura
//       const res = await api.post("/api/auth/login", { email, password });

//       if (!res.data.success) {
//         return { success: false, msg: res.data.msg || "Invalid login" };
//       }

//       const token = res.data.token;

//       // Save JWT
//       await SecureStore.setItemAsync("token", token);
//       setToken(token);

//       // Fetch Tessitura user profile
//       const profile = await api.get("/api/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const fullUser = profile.data.user;

//       // Save profile
//       await SecureStore.setItemAsync("user", JSON.stringify(fullUser));
//       setUser(fullUser);

//       // Ensure Tessitura cart exists
//       const cartRes = await api.get("/api/cart/ensure", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (cartRes.data?.success && cartRes.data?.cartId) {
//         const userWithCart = { ...fullUser, cartId: cartRes.data.cartId };
//         await SecureStore.setItemAsync("user", JSON.stringify(userWithCart));
//         setUser(userWithCart);
//       }

//       return { success: true };
//     } catch (err: any) {
//       console.log("LOGIN ERROR:", err.response?.data || err.message);
//       return { success: false, msg: "Server error" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------------------------------------
//   // SIGN UP
//   // --------------------------------------------------
//   const signUp = async (
//     firstName: string,
//     lastName: string,
//     email: string,
//     password: string
//   ) => {
//     try {
//       setLoading(true);

//       const res = await api.post("/api/auth/register", {
//         firstName,
//         lastName,
//         email,
//         password,
//       });

//       if (!res.data.success) {
//         return { success: false, msg: res.data.msg || "Registration failed" };
//       }

//       return { success: true };
//     } catch (err: any) {
//       console.log("REGISTER ERROR:", err.response?.data || err.message);
//       return { success: false, msg: "Server error" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------------------------------------
//   // SIGN OUT
//   // --------------------------------------------------
//   const signOut = async () => {
//     setUser(null);
//     setToken(null);
//     await SecureStore.deleteItemAsync("token");
//     await SecureStore.deleteItemAsync("user");
//   };

//   // --------------------------------------------------
//   // RESET PASSWORD (Tessitura Token Flow)
//   // --------------------------------------------------
//   const resetPassword = async (
//     email: string,
//     token: string,
//     newPassword: string
//   ) => {
//     try {
//       setLoading(true);

//       const res = await api.post("/api/auth/reset-password", {
//         email,
//         token,
//         newPassword,
//       });

//       return res.data;
//     } catch (err: any) {
//       console.log("RESET PASSWORD ERROR:", err.response?.data || err.message);
//       return { success: false, msg: "Server error" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------------------------------------
//   // CONTEXT VALUE
//   // --------------------------------------------------
//   const value: AuthContextType = {
//     user,
//     token,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//     resetPassword,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// // --------------------------------------------------
// // HOOK
// // --------------------------------------------------
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be inside AuthProvider");
//   return ctx;
// }












// import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import * as SecureStore from "expo-secure-store";
// import api from "@/services/api";

// // interface AuthUser {
// //   id: number;
// //   email: string;
// // }


// interface AuthUser {
//   constituentId: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   emailId: number;
//   phone: string;
//   phoneId: number;
//   addressId: number;
//   address: {
//     street1: string;
//     city: string;
//     province: string;
//     postalCode: string;
//     country: string;
//   };
// }



// interface AuthContextType {
//   user: AuthUser | null;
//   token: string | null;
//   loading: boolean;

//   signIn: (email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
//   signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
//   signOut: () => Promise<void>;
//   resetPassword: (email: string) => Promise<{ success: boolean; msg?: string }>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Load saved token at startup
//   useEffect(() => {
//     (async () => {
//       const savedToken = await SecureStore.getItemAsync("token");
//       const savedUser = await SecureStore.getItemAsync("user");

//       if (savedToken && savedUser) {
//         setToken(savedToken);
//         setUser(JSON.parse(savedUser));
//       }

//       setLoading(false);
//     })();
//   }, []);

//   // ---------------------------------------------
//   // SIGN IN
//   // ---------------------------------------------

//   const signIn = async (email: string, password: string) => {
//     try {
//       setLoading(true);

//       // 1️⃣ Login → get JWT
//       const res = await api.post("/api/auth/login", { email, password });

//       if (!res.data.success) {
//         return { success: false, msg: res.data.msg || "Invalid login" };
//       }

//       const token = res.data.token;

//       // Save token
//       await SecureStore.setItemAsync("token", token);
//       setToken(token);

//       // 2️⃣ Fetch full Tessitura profile
//       const profile = await api.get("/api/auth/me", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const fullUser = profile.data.user;

//       // Save user
//       await SecureStore.setItemAsync("user", JSON.stringify(fullUser));
//       setUser(fullUser);

//       // 3️⃣ ENSURE CART (this creates shared Tessitura cart for this user) ⭐⭐⭐⭐
//       const cartRes = await api.get("/api/cart/ensure", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (cartRes.data?.success && cartRes.data?.cartId) {
//         // Add cartId into user object
//         const userWithCart = { ...fullUser, cartId: cartRes.data.cartId };

//         // Save updated user
//         await SecureStore.setItemAsync("user", JSON.stringify(userWithCart));
//         setUser(userWithCart);
//       }

//       return { success: true };

//     } catch (err: any) {
//       console.log("LOGIN ERROR:", err.response?.data || err.message);
//       return { success: false, msg: "Server error" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------------------------------
//   // SIGN UP (Tessitura + Node backend)
//   // ---------------------------------------------
//   const signUp = async (firstName: string, lastName: string, email: string, password: string) => {
//     try {
//       setLoading(true);

//       const res = await api.post("/api/auth/register", {
//         firstName,
//         lastName,
//         email,
//         password,
//       });

//       if (!res.data.success) {
//         return { success: false, msg: "Registration failed" };
//       }

//       return { success: true };
//     } catch (err: any) {
//       console.log("REGISTER ERROR:", err.response?.data || err.message);
//       return { success: false, msg: "Server error" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------------------------------
//   // SIGN OUT
//   // ---------------------------------------------
//   const signOut = async () => {
//     setUser(null);
//     setToken(null);

//     await SecureStore.deleteItemAsync("token");
//     await SecureStore.deleteItemAsync("user");
//   };

// const resetPassword = async (
//   email: string,
//   token: string,
//   newPassword: string
// ) => {
//   try {
//     setLoading(true);

//     const res = await api.post("/api/auth/reset-password", {
//       email,
//       token,
//       newPassword
//     });

//     return res.data;
//   } catch (err: any) {
//     console.log("RESET PASSWORD ERROR:", err.response?.data || err.message);
//     return { success: false, msg: "Server error" };
//   } finally {
//     setLoading(false);
//   }
// };



//   const value = {
//     user,            // <-- now contains Tessitura user profile
//     token,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//     resetPassword
//   };


//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be inside AuthProvider");
//   return ctx;
// }














// const signIn = async (email: string, password: string) => {
//   try {
//     setLoading(true);

//     // 1. Login → get JWT + basic user info
//     const res = await api.post("/api/auth/login", { email, password });

//     if (!res.data.success) {
//       return { success: false, msg: "Invalid login" };
//     }

//     const token = res.data.token;

//     // 2. Save token securely
//     await SecureStore.setItemAsync("token", token);

//     // 3. Fetch FULL patron profile from /api/auth/me
//     const profile = await api.get("/api/auth/me", {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     // const patronData = profile.data.user.patron;
//     const fullUser = profile.data.user; // <-- includes patron + email + phone + address IDs
//     await SecureStore.setItemAsync("user", JSON.stringify(fullUser));
//     setUser(fullUser);


//     // 4. Save full user/patron data locally
//     // await SecureStore.setItemAsync("user", JSON.stringify(patronData));

//     // 5. Update context state
//     // setUser(patronData);
//     setToken(token);

//     return { success: true };

//   } catch (err: any) {
//     console.log("LOGIN ERROR:", err.response?.data || err.message);
//     return { success: false, msg: "Server error" };
//   } finally {
//     setLoading(false);
//   }
// };










// const signIn = async (email: string, password: string) => {
//   try {
//     setLoading(true);

//     const res = await api.post("/api/auth/login", { email, password });

//     if (!res.data.success) {
//       return { success: false, msg: "Invalid login" };
//     }

//     const newUser = res.data.user;

//     // Save JWT + user data
//     await SecureStore.setItemAsync("token", res.data.token);
//     await SecureStore.setItemAsync("user", JSON.stringify(newUser));

//     setUser(newUser);
//     setToken(res.data.token);

//     return { success: true };
//   } catch (err: any) {
//     console.log("LOGIN ERROR:", err.response?.data || err.message);
//     return { success: false, msg: "Server error" };
//   } finally {
//     setLoading(false);
//   }
// };














// import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { Session, User } from '@supabase/supabase-js';
// import { supabase } from '@/lib/supabase';
// import { tessituraAPI } from '@/services/tessitura';
// import type { Patron } from '@/types/database';

// interface AuthContextType {
//   session: Session | null;
//   user: User | null;
//   patron: Patron | null;
//   loading: boolean;
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
//   signOut: () => Promise<void>;
//   resetPassword: (email: string) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [session, setSession] = useState<Session | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [patron, setPatron] = useState<Patron | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setUser(session?.user ?? null);
//       if (session?.user) {
//         loadPatronData(session.user.id);
//       }
//       setLoading(false);
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       (async () => {
//         setSession(session);
//         setUser(session?.user ?? null);
//         if (session?.user) {
//           await loadPatronData(session.user.id);
//         } else {
//           setPatron(null);
//         }
//         setLoading(false);
//       })();
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const loadPatronData = async (userId: string) => {
//     try {
//       const { data, error } = await supabase
//         .from('patrons')
//         .select('*')
//         .eq('id', userId)
//         .maybeSingle();

//       if (error) throw error;
//       setPatron(data);
//     } catch (error) {
//       console.error('Error loading patron data:', error);
//     }
//   };

//   const signIn = async (email: string, password: string) => {
//     try {
//       setLoading(true);

//       const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (authError) {
//         throw authError;
//       }

//       if (authData.user) {
//         const { data: existingPatron } = await supabase
//           .from('patrons')
//           .select('*')
//           .eq('id', authData.user.id)
//           .maybeSingle();

//         if (!existingPatron) {
//           try {
//             const tessituraPatron = await tessituraAPI.authenticatePatron(email, password);
//             await syncPatronToSupabase(authData.user.id, tessituraPatron);
//           } catch (tessituraError) {
//             console.log('Tessitura sync skipped:', tessituraError);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Sign in error:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
//     try {
//       setLoading(true);

//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (error) throw error;

//       if (data.user) {
//         await supabase.from('patrons').insert({
//           id: data.user.id,
//           tessitura_id: '',
//           email,
//           first_name: firstName,
//           last_name: lastName,
//         });
//       }
//     } catch (error) {
//       console.error('Sign up error:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signOut = async () => {
//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.signOut();
//       if (error) throw error;
//       setPatron(null);
//     } catch (error) {
//       console.error('Sign out error:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetPassword = async (email: string) => {
//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(email, {
//         redirectTo: 'calgaryopera://reset-password',
//       });
//       if (error) throw error;
//     } catch (error) {
//       console.error('Reset password error:', error);
//       throw error;
//     }
//   };

//   const syncPatronToSupabase = async (userId: string, tessituraPatron: any) => {
//     const primaryAddress = tessituraPatron.addresses?.find((addr: any) => addr.isPrimary);

//     await supabase.from('patrons').insert({
//       id: userId,
//       tessitura_id: tessituraPatron.id,
//       email: tessituraPatron.email,
//       first_name: tessituraPatron.firstName,
//       last_name: tessituraPatron.lastName,
//       phone: tessituraPatron.phone,
//       address_line1: primaryAddress?.line1,
//       address_line2: primaryAddress?.line2,
//       city: primaryAddress?.city,
//       province: primaryAddress?.state,
//       postal_code: primaryAddress?.postalCode,
//       country: primaryAddress?.country,
//       preferences: tessituraPatron.preferences || {},
//     });
//   };

//   const value = {
//     session,
//     user,
//     patron,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//     resetPassword,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
