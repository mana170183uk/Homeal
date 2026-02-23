import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK.
// Supports two modes:
// 1. FIREBASE_SERVICE_ACCOUNT_JSON env var (JSON string of the service account key)
// 2. GOOGLE_APPLICATION_CREDENTIALS env var (path to service account key file)
function initFirebaseAdmin() {
  if (getApps().length > 0) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS or Application Default Credentials
    initializeApp();
  }
}

initFirebaseAdmin();

const firebaseAdminAuth = getAuth();

export { firebaseAdminAuth };

/**
 * Delete a Firebase user by UID. Returns true if deleted, false if not found.
 */
export async function deleteFirebaseUser(uid: string): Promise<boolean> {
  try {
    await firebaseAdminAuth.deleteUser(uid);
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/user-not-found") return false;
    throw err;
  }
}

/**
 * Delete a Firebase user by email. Returns true if deleted, false if not found.
 */
export async function deleteFirebaseUserByEmail(email: string): Promise<boolean> {
  try {
    const user = await firebaseAdminAuth.getUserByEmail(email);
    await firebaseAdminAuth.deleteUser(user.uid);
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/user-not-found") return false;
    throw err;
  }
}

/**
 * Set custom claims on a Firebase user (role + super_admin flag).
 */
export async function setFirebaseCustomClaims(
  uid: string,
  claims: { role: string; super_admin?: boolean }
): Promise<void> {
  await firebaseAdminAuth.setCustomUserClaims(uid, claims);
  console.log(`[Firebase] Set custom claims for UID ${uid}:`, claims);
}

/**
 * Get Firebase custom claims for a user by UID. Returns null if user not found.
 */
export async function getFirebaseCustomClaims(
  uid: string
): Promise<Record<string, unknown> | null> {
  try {
    const user = await firebaseAdminAuth.getUser(uid);
    return user.customClaims || null;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/user-not-found") return null;
    throw err;
  }
}
