// ManageAccountScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { router } from "expo-router";
import { JSX } from "react/jsx-runtime";

type Option = { label: string; value: number | string };
type FormFields = {
  prefixId: number | null;
  firstName: string;
  middleName: string;
  lastName: string;
  suffixId: number | null;
  email: string;
  phone: string;
  street1: string;
  city: string;
  provinceId: number | null;
  postalCode: string;
  countryId: number | null;
};
// suffix: string;

export default function ManageAccountScreen(): JSX.Element {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  const [prefixOptions, setPrefixOptions] = useState<Option[]>([]);
  const [suffixOptions, setSuffixOptions] = useState<Option[]>([]);
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);

  const [openPrefix, setOpenPrefix] = useState<boolean>(false);
  const [openSuffix, setOpenSuffix] = useState<boolean>(false);
  const [openCountry, setOpenCountry] = useState<boolean>(false);
  const [openProvince, setOpenProvince] = useState<boolean>(false);

  const [form, setForm] = useState<FormFields>({
    prefixId: null,
    firstName: "",
    middleName: "",
    lastName: "",
    suffixId: null,
    email: "",
    phone: "",
    street1: "",
    city: "",
    provinceId: null,
    postalCode: "",
    countryId: null,
  });
  // suffix: "None",

  function handleChange(field: keyof FormFields, val: string | number | null) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  useEffect(() => {
    if (!token) return;
    (async () => {
      await loadReferences();
      await loadProfile();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadReferences(): Promise<void> {
    try {
      const [prefRes, suffRes, countriesRes] = await Promise.all([
        api.get("/api/reference/prefixes"),
        api.get("/api/reference/suffixes"),
        api.get("/api/reference/countries"),
      ]);

      // const prefOptions: Option[] = prefRes.data.map((p: any) => ({
      //   label: p.Description || String(p.Id),
      //   value: p.Id,
      // }));
      // setPrefixOptions(prefOptions);

      // const suffOptions: Option[] = suffRes.data.map((p: any) => ({
      //   label: p.Description || String(p.Id),
      //   value: p.Id,
      // }));
      // setSuffixOptions(suffOptions);




      // Allowed lists
const allowedPrefixes = ["None", "Dr.", "Miss", "Mr.", "Mrs.", "Ms."];
const allowedSuffixes = ["None", "Jr", "MD", "PHD", "Sr"];

// ---------- PREFIX OPTIONS ----------
const prefOptions: Option[] = prefRes.data
  .map((p: any): Option => {
    const raw = (p.Description ?? "").trim();
    const label = raw.length > 0 ? raw : "None";
    return {
      label,
      value: Number(p.Id),
    };
  })
  // keep only your allowed prefix labels
  .filter((opt: Option) => allowedPrefixes.includes(opt.label))
  // remove duplicates
  .filter(
    (item: Option, index: number, arr: Option[]) =>
      arr.findIndex((i: Option) => i.value === item.value) === index
  );

setPrefixOptions(prefOptions);

// ---------- SUFFIX OPTIONS ----------
const suffOptions: Option[] = suffRes.data
  .map((s: any): Option => {
    const raw = (s.Description ?? "").trim();
    const label = raw.length > 0 ? raw : "None";
    return {
      label,
      value: Number(s.Id),
    };
  })
  // keep only your allowed suffix labels
  .filter((opt: Option) => allowedSuffixes.includes(opt.label))
  // remove duplicates
  .filter(
    (item: Option, index: number, arr: Option[]) =>
      arr.findIndex((i: Option) => i.value === item.value) === index
  );

setSuffixOptions(suffOptions);




      // // ---------- PREFIX OPTIONS ----------
      // const prefOptions: Option[] = prefRes.data
      //   .map((p: any): Option => {
      //     const label: string = (p.Description ?? "").trim();
      //     return {
      //       label: label.length > 0 ? label : "None",
      //       value: Number(p.Id),
      //     };
      //   })
      //   .filter((item: Option, index: number, arr: Option[]): boolean => {
      //     return arr.findIndex((i: Option) => i.value === item.value) === index;
      //   });

      // setPrefixOptions(prefOptions);

      // // ---------- SUFFIX OPTIONS ----------
      // const suffOptions: Option[] = suffRes.data
      //   .map((s: any): Option => {
      //     const label: string = (s.Description ?? "").trim();
      //     return {
      //       label: label.length > 0 ? label : "None",
      //       value: Number(s.Id),
      //     };
      //   })
      //   .filter((item: Option, index: number, arr: Option[]): boolean => {
      //     return arr.findIndex((i: Option) => i.value === item.value) === index;
      //   });

      // setSuffixOptions(suffOptions);


      const countryOpts: Option[] = countriesRes.data.map((c: any) => ({
        label: c.Description || c.Name || String(c.Id),
        value: c.Id,
      }));
      setCountryOptions(countryOpts);
    } catch (err) {
      console.log("REFERENCE LOAD ERROR:", err);
      Alert.alert("Error", "Failed to load reference data.");
    }
  }

  async function loadProvinces(countryId: number): Promise<void> {
    try {
      const res = await api.get(`/api/reference/states/${countryId}`);
      const opts: Option[] = res.data.map((s: any) => ({
        // prefer a human label; fall back to StateCode or Description
        label: s.Description || s.StateCode || String(s.Id),
        value: s.Id,
      }));
      setProvinceOptions(opts);
    } catch (err) {
      console.log("PROVINCE LOAD ERROR:", err);
      setProvinceOptions([]);
    }
  }

  async function loadProfile(): Promise<void> {
    try {
      const res = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.success) throw new Error("Profile failed");

      const u = res.data.user;
      setForm({
        prefixId: u.prefixId ?? null,
        firstName: u.firstName || "",
        middleName: u.middleName || "",
        lastName: u.lastName || "",
        suffixId: u.suffixId || null,
        email: u.email || "",
        phone: u.phone || "",
        street1: u.address?.street1 || "",
        city: u.address?.city || "",
        provinceId: u.address?.provinceId ?? null,
        postalCode: u.address?.postalCode || "",
        countryId: u.address?.countryId ?? null,
      });
      // suffix: u.suffix || "None",

      if (u.address?.countryId) {
        await loadProvinces(Number(u.address.countryId));
      }

      setLoading(false);
    } catch (err) {
      console.log("LOAD PROFILE ERROR:", err);
      Alert.alert("Error", "Failed to load account.");
    }
  }

  async function handleSave(): Promise<void> {
    Alert.alert("Save Changes?", "Your account will be updated.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: async () => {
          try {
            const body = {
              // body shape expected by backend
              constituentId: user?.constituentId,
              emailId: user?.emailId,
              phoneId: user?.phoneId,
              addressId: user?.addressId,

              prefixId: form.prefixId,
              firstName: form.firstName,
              middleName: form.middleName,
              lastName: form.lastName,
              suffixId: form.suffixId,

              email: form.email,
              phone: form.phone,

              street1: form.street1,
              city: form.city,
              provinceId: form.provinceId,
              postalCode: form.postalCode,
              countryId: form.countryId,
            };
            // suffix: form.suffix,

            const res = await api.put("/api/account/update", body, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.data.success) throw new Error("Update failed");

            Alert.alert("Success", "Account updated!");
            router.back();
          } catch (err) {
            console.log("UPDATE ERROR:", err);
            Alert.alert("Error", "Failed to update account.");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#8B0000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Manage Account</Text>

        <Dropdown
          label="Prefix"
          value={form.prefixId}
          open={openPrefix}
          setOpen={setOpenPrefix}
          options={prefixOptions}
          onChange={(v) => handleChange("prefixId", Number(v))}
        />

        <Input label="First Name" value={form.firstName} onChange={(v) => handleChange("firstName", v)} />
        <Input label="Middle Name" value={form.middleName} onChange={(v) => handleChange("middleName", v)} />
        <Input label="Last Name" value={form.lastName} onChange={(v) => handleChange("lastName", v)} />

        <Dropdown
          label="Suffix"
          value={form.suffixId}
          open={openSuffix}
          setOpen={setOpenSuffix}
          options={suffixOptions}
          onChange={(v) => handleChange("suffixId", Number(v))}
        />
        {/* <Dropdown
          label="Suffix"
          value={form.suffix}
          open={openSuffix}
          setOpen={setOpenSuffix}
          options={[
            { label: "None", value: "None" },
            { label: "Jr", value: "Jr" },
            { label: "MD", value: "MD" },
            { label: "PHD", value: "PHD" },
            { label: "Sr", value: "Sr" },
          ]}
          onChange={(v) => handleChange("suffix", String(v))}
        /> */}

        <Input label="Email" value={form.email} onChange={(v) => handleChange("email", v)} />
        <Input label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} />

        <Input label="Street" value={form.street1} onChange={(v) => handleChange("street1", v)} />
        <Input label="City" value={form.city} onChange={(v) => handleChange("city", v)} />

        <Dropdown
          label="Country"
          value={form.countryId}
          open={openCountry}
          setOpen={setOpenCountry}
          options={countryOptions}
          onChange={async (v) => {
            const num = Number(v);
            handleChange("countryId", num);
            handleChange("provinceId", null);
            await loadProvinces(num);
          }}
        />

        <Dropdown
          label="Province / State"
          value={form.provinceId}
          open={openProvince}
          setOpen={setOpenProvince}
          options={provinceOptions}
          onChange={(v) => handleChange("provinceId", Number(v))}
        />

        <Input label="Postal Code" value={form.postalCode} onChange={(v) => handleChange("postalCode", v)} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Reusable Input ---------- */
function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={(v) => onChange(v)} />
    </View>
  );
}

/* ---------- Dropdown (custom, scrollable) ---------- */
function Dropdown({
  label,
  value,
  options,
  open,
  setOpen,
  onChange,
}: {
  label: string;
  value: string | number | null;
  options: Option[];
  open: boolean;
  setOpen: (v: boolean) => void;
  onChange: (v: string | number) => void;
}): JSX.Element {
  const selectedLabel = () => {
    const found = options.find((o) => o.value === value);
    if (found) return found.label;
    return "Select...";
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => {
          // on Android the keyboard may be open: blur by toggling open
          setOpen(!open);
        }}
      >
        <Text style={styles.dropdownText}>{selectedLabel()}</Text>
      </TouchableOpacity>

      {open && (
        // ScrollView limited height so long lists scroll
        <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
          {options.map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              style={styles.dropdownItem}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },

  inputGroup: { marginBottom: 16, zIndex: 1000 },
  label: { fontSize: 14, marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
  },
  dropdownText: { fontSize: 16 },
  dropdownList: {
    maxHeight: 240,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginTop: 6,
    borderRadius: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: { fontSize: 16 },

  saveBtn: {
    marginTop: 20,
    backgroundColor: "#8B0000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});






















// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useState, useEffect } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import api from "@/services/api";
// import { router } from "expo-router";

// // ---------------------------------------------
// // FORM TYPE
// // ---------------------------------------------
// type FormFields = {
//   prefix: string;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   suffix: string;

//   email: string;
//   phone: string;

//   street1: string;
//   city: string;
//   country: string;
//   province: string;
//   postalCode: string;
// };

// export default function ManageAccountScreen() {
//   const { user, token } = useAuth();
//   const [loading, setLoading] = useState(true);

//   const [countries, setCountries] = useState<any[]>([]);
//   const [states, setStates] = useState<any[]>([]);

//   // dropdown visibility
//   const [openPrefix, setOpenPrefix] = useState(false);
//   const [openSuffix, setOpenSuffix] = useState(false);
//   const [openCountry, setOpenCountry] = useState(false);
//   const [openProvince, setOpenProvince] = useState(false);

//   const [form, setForm] = useState<FormFields>({
//     prefix: "None",
//     firstName: "",
//     middleName: "",
//     lastName: "",
//     suffix: "None",

//     email: "",
//     phone: "",

//     street1: "",
//     city: "",
//     country: "",
//     province: "",
//     postalCode: "",
//   });

//   const handleChange = (field: keyof FormFields, value: string) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   // ---------------------------------------------
//   // LOAD DATA
//   // ---------------------------------------------
//   useEffect(() => {
//     if (!token) return;
//     loadReferenceData();
//     loadProfileFromBackend();
//   }, [token]);

//   async function loadReferenceData() {
//     try {
//       const c = await api.get("/api/reference/countries");
//       const s = await api.get("/api/reference/states");

//       setCountries(c.data);
//       setStates(s.data);
//     } catch (err) {
//       console.log("REFERENCE ERROR:", err);
//     }
//   }

//   async function loadProfileFromBackend() {
//     try {
//       const res = await api.get("/api/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.data.success) throw new Error("Failed loading profile");

//       const u = res.data.user;

//       setForm({
//         prefix: u.prefix || "None",
//         firstName: u.firstName || "",
//         middleName: u.middleName || "",
//         lastName: u.lastName || "",
//         suffix: u.suffix || "None",

//         email: u.email || "",
//         phone: u.phone || "",

//         street1: u.address?.street1 || "",
//         city: u.address?.city || "",
//         province: u.address?.province || "",
//         postalCode: u.address?.postalCode || "",
//         country: u.address?.country || "",
//       });

//       setLoading(false);
//     } catch (err) {
//       console.log("LOAD PROFILE ERROR:", err);
//       Alert.alert("Error", "Failed to load account.");
//     }
//   }

//   // ---------------------------------------------
//   // SAVE CHANGES
//   // ---------------------------------------------
//   async function handleSave() {
//     Alert.alert("Save Changes?", "Your account will be updated.", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Save",
//         onPress: async () => {
//           try {
//             const res = await api.put(
//               "/api/account/update",
//               {
//                 ...form,
//                 constituentId: user?.constituentId,
//                 emailId: user?.emailId,
//                 phoneId: user?.phoneId,
//                 addressId: user?.addressId,
//               },
//               { headers: { Authorization: `Bearer ${token}` } }
//             );

//             if (!res.data.success) throw new Error("Update failed");

//             Alert.alert("Success", "Account updated!");
//             router.back();
//           } catch (err) {
//             console.log("SAVE ERROR:", err);
//             Alert.alert("Error", "Failed to update account.");
//           }
//         },
//       },
//     ]);
//   }

//   // ---------------------------------------------
//   // LOADING SCREEN
//   // ---------------------------------------------
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.center}>
//         <ActivityIndicator size="large" color="#8B0000" />
//       </SafeAreaView>
//     );
//   }

//   // ---------------------------------------------
//   // RENDER SCREEN
//   // ---------------------------------------------
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.inner}>
//         <Text style={styles.title}>Manage Account</Text>

//         {/* Prefix */}
//         <Dropdown
//           label="Prefix"
//           value={form.prefix}
//           open={openPrefix}
//           setOpen={setOpenPrefix}
//           options={["None", "Dr.", "Mr.", "Mrs.", "Ms.", "Miss"]}
//           onChange={(v) => handleChange("prefix", v)}
//         />

//         <Input label="First Name" value={form.firstName} onChange={(v) => handleChange("firstName", v)} />
//         <Input label="Middle Name" value={form.middleName} onChange={(v) => handleChange("middleName", v)} />
//         <Input label="Last Name" value={form.lastName} onChange={(v) => handleChange("lastName", v)} />

//         {/* Suffix */}
//         <Dropdown
//           label="Suffix"
//           value={form.suffix}
//           open={openSuffix}
//           setOpen={setOpenSuffix}
//           options={["None", "Jr", "MD", "PHD", "Sr"]}
//           onChange={(v) => handleChange("suffix", v)}
//         />

//         <Input label="Email" value={form.email} onChange={(v) => handleChange("email", v)} />
//         <Input label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} />

//         <Input label="Street" value={form.street1} onChange={(v) => handleChange("street1", v)} />
//         <Input label="City" value={form.city} onChange={(v) => handleChange("city", v)} />

//         {/* Country Dropdown */}
//         <Dropdown
//           label="Country"
//           value={form.country}
//           open={openCountry}
//           setOpen={setOpenCountry}
//           options={countries.map((c) => c.Description)}
//           onChange={(v) => {
//             handleChange("country", v);
//             handleChange("province", "");
//           }}
//         />

//         {/* Province Dropdown */}
//         <Dropdown
//           label="Province"
//           value={form.province}
//           open={openProvince}
//           setOpen={setOpenProvince}
//           options={states.filter((s) => s.Country?.Description === form.country).map((s) => s.StateCode)}
//           onChange={(v) => handleChange("province", v)}
//         />

//         <Input
//           label="Postal Code"
//           value={form.postalCode}
//           onChange={(v) => handleChange("postalCode", v)}
//         />

//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>Save Changes</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // ---------------------------------------------
// // INPUT COMPONENT
// // ---------------------------------------------
// function Input({
//   label,
//   value,
//   onChange,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
// }) {
//   return (
//     <View style={styles.inputGroup}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput style={styles.input} value={value} onChangeText={onChange} />
//     </View>
//   );
// }

// // ---------------------------------------------
// // CUSTOM DROPDOWN
// // ---------------------------------------------
// function Dropdown({
//   label,
//   value,
//   options,
//   open,
//   setOpen,
//   onChange,
// }: {
//   label: string;
//   value: string;
//   options: string[];
//   open: boolean;
//   setOpen: (v: boolean) => void;
//   onChange: (v: string) => void;
// }) {
//   return (
//     <View style={styles.inputGroup}>
//       <Text style={styles.label}>{label}</Text>

//       <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(!open)}>
//         <Text style={styles.dropdownText}>{value || "Select"}</Text>
//       </TouchableOpacity>

//       {open && (
//         <View style={styles.dropdownMenu}>
//           {options.map((opt) => (
//             <TouchableOpacity
//               key={opt}
//               style={styles.dropdownItem}
//               onPress={() => {
//                 onChange(opt);
//                 setOpen(false);
//               }}
//             >
//               <Text style={styles.dropdownItemText}>{opt}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// }

// // ---------------------------------------------
// // STYLES
// // ---------------------------------------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   inner: { padding: 20 },
//   title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },

//   inputGroup: { marginBottom: 16 },
//   label: { fontSize: 14, marginBottom: 5, color: "#555" },

//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     borderRadius: 8,
//   },

//   dropdown: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: "#f7f7f7",
//   },
//   dropdownText: { fontSize: 16 },

//   dropdownMenu: {
//     position: "absolute",
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     width: "100%",
//     top: 52,
//     borderRadius: 8,
//     zIndex: 999,
//   },

//   dropdownItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },

//   dropdownItemText: {
//     fontSize: 16,
//   },

//   saveBtn: {
//     marginTop: 30,
//     backgroundColor: "#8B0000",
//     padding: 16,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   saveText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },

//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });























// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useState, useEffect } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import api from "@/services/api";
// import { router } from "expo-router";

// // ---------------------------------------------
// // FORM TYPE
// // ---------------------------------------------
// type FormFields = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   street1: string;
//   city: string;
//   province: string;
//   postalCode: string;
//   country: string;
// };

// export default function ManageAccountScreen() {
//   const { user, token } = useAuth();
//   const [loading, setLoading] = useState(true);

//   const [form, setForm] = useState<FormFields>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     street1: "",
//     city: "",
//     province: "",
//     postalCode: "",
//     country: "",
//   });

//   const handleChange = (field: keyof FormFields, value: string) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   // ---------------------------------------------
//   // LOAD DATA FROM BACKEND
//   // ---------------------------------------------
//   useEffect(() => {
//     if (!token) return;
//     loadProfileFromBackend();
//   }, [token]);

//   async function loadProfileFromBackend() {
//     try {
//       const res = await api.get("/api/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.data.success) throw new Error("Failed loading profile");

//       const u = res.data.user;

//       setForm({
//         firstName: u.firstName || "",
//         lastName: u.lastName || "",
//         email: u.email || "",
//         phone: u.phone || "",
//         street1: u.address?.street1 || "",
//         city: u.address?.city || "",
//         province: u.address?.province || "",
//         postalCode: u.address?.postalCode || "",
//         country: u.address?.country || "",
//       });

//       setLoading(false);
//     } catch (err) {
//       console.log("LOAD PROFILE ERROR:", err);
//       Alert.alert("Error", "Failed to load account.");
//     }
//   }

//   // ---------------------------------------------
//   // SAVE CHANGES (CALL BACKEND)
//   // ---------------------------------------------
//   async function handleSave() {
//     Alert.alert("Save Changes?", "Your account will be updated.", [
//       { text: "Cancel", style: "cancel" },

//       {
//         text: "Save",
//         onPress: async () => {
//           try {
//             console.log("FORM DATA TO SAVE:", form);
//             console.log("USER DATA:", user);
//             console.log("ContituentId:", user?.constituentId);
//             const res = await api.put(
//               "/api/account/update",
//               {
//                 ...form,
//                 constituentId: user?.constituentId,
//                 emailId: user?.emailId,
//                 phoneId: user?.phoneId,
//                 addressId: user?.addressId,
//               },
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                 },
//               }
//             );

//             if (!res.data.success) {
//               throw new Error("Update failed");
//             }

//             Alert.alert("Success", "Account updated successfully!");
//             router.back();
//           } catch (err) {
//             console.log("SAVE ERROR:", err);
//             Alert.alert("Error", "Failed to update account.");
//           }
//         },
//       },
//     ]);
//   }

//   // ---------------------------------------------
//   // RENDER LOADING
//   // ---------------------------------------------
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.center}>
//         <ActivityIndicator size="large" color="#8B0000" />
//       </SafeAreaView>
//     );
//   }

//   // ---------------------------------------------
//   // RENDER SCREEN
//   // ---------------------------------------------
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.inner}>
//         <Text style={styles.title}>Manage Account</Text>

//         {(Object.keys(form) as (keyof FormFields)[]).map((key) => (
//           <View key={key} style={styles.inputGroup}>
//             <Text style={styles.label}>{key}</Text>

//             <TextInput
//               style={styles.input}
//               value={form[key]}
//               onChangeText={(v) => handleChange(key, v)}
//             />
//           </View>
//         ))}

//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>Save Changes</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // ---------------------------------------------
// // STYLES
// // ---------------------------------------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   inner: { padding: 20 },
//   title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
//   inputGroup: { marginBottom: 12 },
//   label: { fontSize: 14, marginBottom: 5, color: "#555" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     borderRadius: 8,
//   },
//   saveBtn: {
//     marginTop: 30,
//     backgroundColor: "#8B0000",
//     padding: 16,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });