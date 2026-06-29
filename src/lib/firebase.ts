import { initializeApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ZoneRef, Street, Area, CityVillage, SubStreet, GeoTaluk, GeoDistrict } from "../types";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore database using the custom firestoreDatabaseId if provided
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
});

// Initialize Firebase Auth
export const auth = getAuth(app);

/**
 * Fetch a whole Firestore collection and return its documents mapped as objects.
 */
export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
    });
    return items;
  } catch (error) {
    console.error(`Firebase fetchCollection error for ${collectionName.replace(/[\r\n]/g, ' ')}:`, String(error).replace(/[\r\n]/g, ' '));
    return [];
  }
}

/**
 * Save / Update a document inside a Firestore collection.
 */
export async function saveDoc(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Firebase saveDoc error for ${collectionName.replace(/[\r\n]/g, ' ')}/${docId.replace(/[\r\n]/g, ' ')}:`, String(error).replace(/[\r\n]/g, ' '));
    throw error;
  }
}

/**
 * Delete a document inside a Firestore collection.
 */
export async function deleteDocById(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Firebase deleteDocById error for ${collectionName.replace(/[\r\n]/g, ' ')}/${docId.replace(/[\r\n]/g, ' ')}:`, String(error).replace(/[\r\n]/g, ' '));
    throw error;
  }
}

/**
 * Seeds a collection if it is completely empty in Firestore, returning the loaded dataset.
 */
export async function seedCollectionIfEmpty<T extends Record<string, any>>(
  collectionName: string,
  seedData: T[],
  idKey: string = "id"
): Promise<T[]> {
  try {
    const existing = await fetchCollection<T>(collectionName);
    if (existing.length > 0) {
      return existing;
    }

    // Collection is empty, seed it!
    console.log(`Seeding empty collection is triggered for: ${collectionName.replace(/[\r\n]/g, ' ')}`);
    const batch = writeBatch(db);
    
    // Firestore batch limit is 500 writes
    const maxBatchSize = 400;
    const slices = [];
    for (let i = 0; i < seedData.length; i += maxBatchSize) {
      slices.push(seedData.slice(i, i + maxBatchSize));
    }

    for (const slice of slices) {
      const currentBatch = writeBatch(db);
      for (const item of slice) {
        const docId = String(item[idKey]);
        const docRef = doc(db, collectionName, docId);
        // remove the custom 'id' or other identifier if we want, but keeping it is fine and helpful
        currentBatch.set(docRef, { ...item });
      }
      await currentBatch.commit();
    }
    
    return seedData;
  } catch (error) {
    console.error(`Firebase seeding error for ${collectionName.replace(/[\r\n]/g, ' ')}:`, String(error).replace(/[\r\n]/g, ' '));
    return seedData;
  }
}

/**
 * Builds zone PKs and addresses dynamically from lists of geo records
 */
export function buildDynamicZoneRefs(
  streets: Street[],
  areas: Area[],
  cities: CityVillage[],
  substreets: SubStreet[],
  taluks: GeoTaluk[],
  districts: GeoDistrict[]
): ZoneRef[] {
  const refs: ZoneRef[] = [];
  
  // Build a lookup map for districts
  const districtMap = new Map<string, GeoDistrict>();
  districts.forEach(d => districtMap.set(d.id, d));
  
  for (const s of streets) {
    const a = areas.find(x => x.id === s.areaId);
    if (!a) continue;
    const cv = cities.find(x => x.id === a.cityVillageId);
    if (!cv) continue;
    const t = taluks.find(x => x.id === cv.talukId);
    if (!t) continue;
    
    // Suffix splits
    const cvIdSuffix = cv.id.split("-")[2] || cv.id;
    const aIdSuffix = a.id.split("-")[2] || a.id;
    const sIdSuffix = s.id.split("-")[2] || s.id;
    
    const street_pk = `ZON-${cvIdSuffix}-${aIdSuffix}-${sIdSuffix}`;
    
    // Resolve location info dynamically from actual district data
    const district = districtMap.get(t.districtId);
    const stateSuffix = t.id.includes("-PY") || cv.id.includes("-PY") ? "Puducherry UT" : "Tamil Nadu, India";
    const distSuffix = district?.name || "Unknown District";

    refs.push({
      zone_pk: street_pk,
      stateId: t.id.includes("-PY") ? "GEO-PY" : "GEO-TN",
      districtId: t.districtId,
      talukId: t.id,
      cityVillageId: cv.id,
      areaId: a.id,
      streetId: s.id,
      substreetId: null,
      fullAddress: `${s.name}, ${a.name}, ${cv.name}, ${t.name}, ${distSuffix}, ${stateSuffix}`
    });

    const relevantSubs = substreets.filter(sub => sub.streetId === s.id);
    for (const sub of relevantSubs) {
      const subIdSuffix = sub.id.split("-")[2] || sub.id;
      const sub_pk = `${street_pk}-SUB-${subIdSuffix}`;
      refs.push({
        zone_pk: sub_pk,
        stateId: t.id.includes("-PY") ? "GEO-PY" : "GEO-TN",
        districtId: t.districtId,
        talukId: t.id,
        cityVillageId: cv.id,
        areaId: a.id,
        streetId: s.id,
        substreetId: sub.id,
        fullAddress: `${sub.name}, ${s.name}, ${a.name}, ${cv.name}, ${t.name}, ${distSuffix}, ${stateSuffix}`
      });
    }
  }
  
  return refs;
}

