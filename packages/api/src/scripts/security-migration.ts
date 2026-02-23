/**
 * Security Migration Script
 *
 * Run with: npx tsx packages/api/src/scripts/security-migration.ts
 *
 * This script:
 * 1. Deletes 3 unauthorized users from Firebase Auth + DB
 * 2. Downgrades raj-278@hotmail.com from SUPER_ADMIN → ADMIN
 * 3. Sets Firebase custom claims for homealforuk@gmail.com
 * 4. Removes seed super admin (superadmin@homeal.co.uk) from DB
 */

import prisma from "@homeal/db";
import { firebaseAdminAuth, deleteFirebaseUserByEmail, setFirebaseCustomClaims } from "../lib/firebaseAdmin";

const UNAUTHORIZED_EMAILS = [
  "rajvirsandhu8@gmail.com",
  "rajvir.singhcf@gmail.com",
  "basalatkhan@gmail.com",
];

const DOWNGRADE_EMAIL = "raj-278@hotmail.com";
const PLATFORM_OWNER_EMAIL = "homealforuk@gmail.com";
const SEED_SUPER_ADMIN_EMAIL = "superadmin@homeal.co.uk";

async function main() {
  console.log("=== Homeal Security Migration ===\n");

  // 1. Delete unauthorized users
  console.log("--- Step 1: Delete unauthorized users ---");
  for (const email of UNAUTHORIZED_EMAILS) {
    // Delete from Firebase
    try {
      const deleted = await deleteFirebaseUserByEmail(email);
      console.log(`  Firebase: ${email} → ${deleted ? "DELETED" : "NOT FOUND"}`);
    } catch (err) {
      console.error(`  Firebase: ${email} → ERROR:`, err);
    }

    // Delete from DB (cascade will remove related records)
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Delete chef record first if exists
        await prisma.chef.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`  DB: ${email} → DELETED (role was ${user.role})`);
      } else {
        console.log(`  DB: ${email} → NOT FOUND`);
      }
    } catch (err) {
      console.error(`  DB: ${email} → ERROR:`, err);
    }
  }

  // 2. Downgrade raj-278@hotmail.com from SUPER_ADMIN → ADMIN
  console.log("\n--- Step 2: Downgrade raj-278@hotmail.com ---");
  try {
    const rajUser = await prisma.user.findUnique({ where: { email: DOWNGRADE_EMAIL } });
    if (rajUser) {
      if (rajUser.role === "SUPER_ADMIN") {
        await prisma.user.update({
          where: { email: DOWNGRADE_EMAIL },
          data: { role: "ADMIN" },
        });
        console.log(`  DB: ${DOWNGRADE_EMAIL} → downgraded SUPER_ADMIN → ADMIN`);
      } else {
        console.log(`  DB: ${DOWNGRADE_EMAIL} → already role=${rajUser.role}, no change`);
      }

      // Remove super_admin Firebase claim if present
      if (rajUser.firebaseUid) {
        try {
          await setFirebaseCustomClaims(rajUser.firebaseUid, { role: "ADMIN" });
          console.log(`  Firebase: ${DOWNGRADE_EMAIL} → claims set to { role: "ADMIN" }`);
        } catch (err) {
          console.error(`  Firebase: ${DOWNGRADE_EMAIL} → claims ERROR:`, err);
        }
      }
    } else {
      console.log(`  DB: ${DOWNGRADE_EMAIL} → NOT FOUND`);
    }
  } catch (err) {
    console.error(`  Error downgrading ${DOWNGRADE_EMAIL}:`, err);
  }

  // 3. Set Firebase custom claims for platform owner
  console.log("\n--- Step 3: Set Firebase claims for platform owner ---");
  try {
    const owner = await prisma.user.findUnique({ where: { email: PLATFORM_OWNER_EMAIL } });
    if (owner?.firebaseUid) {
      await setFirebaseCustomClaims(owner.firebaseUid, { role: "SUPER_ADMIN", super_admin: true });
      console.log(`  Firebase: ${PLATFORM_OWNER_EMAIL} → claims set to { role: "SUPER_ADMIN", super_admin: true }`);

      // Ensure DB role is correct
      if (owner.role !== "SUPER_ADMIN") {
        await prisma.user.update({
          where: { email: PLATFORM_OWNER_EMAIL },
          data: { role: "SUPER_ADMIN" },
        });
        console.log(`  DB: ${PLATFORM_OWNER_EMAIL} → role updated to SUPER_ADMIN`);
      } else {
        console.log(`  DB: ${PLATFORM_OWNER_EMAIL} → already SUPER_ADMIN`);
      }
    } else if (owner) {
      console.log(`  WARNING: ${PLATFORM_OWNER_EMAIL} has no firebaseUid — cannot set claims`);
    } else {
      console.log(`  WARNING: ${PLATFORM_OWNER_EMAIL} not found in DB`);
    }
  } catch (err) {
    console.error(`  Error setting claims for ${PLATFORM_OWNER_EMAIL}:`, err);
  }

  // 4. Remove seed super admin
  console.log("\n--- Step 4: Remove seed super admin ---");
  try {
    const seedAdmin = await prisma.user.findUnique({ where: { email: SEED_SUPER_ADMIN_EMAIL } });
    if (seedAdmin) {
      await prisma.user.delete({ where: { email: SEED_SUPER_ADMIN_EMAIL } });
      console.log(`  DB: ${SEED_SUPER_ADMIN_EMAIL} → DELETED`);
    } else {
      console.log(`  DB: ${SEED_SUPER_ADMIN_EMAIL} → NOT FOUND (already removed)`);
    }
  } catch (err) {
    console.error(`  Error removing seed admin:`, err);
  }

  // 5. Print summary
  console.log("\n--- Summary ---");
  const superAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { email: true, firebaseUid: true },
  });
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  const totalUsers = await prisma.user.count();

  console.log(`  Total users: ${totalUsers}`);
  console.log(`  SUPER_ADMINs: ${superAdmins.map(u => u.email).join(", ") || "none"}`);
  console.log(`  ADMINs: ${admins.map(u => u.email).join(", ") || "none"}`);

  // Verify Firebase claims for super admins
  for (const admin of superAdmins) {
    if (admin.firebaseUid) {
      try {
        const fbUser = await firebaseAdminAuth.getUser(admin.firebaseUid);
        console.log(`  Firebase claims for ${admin.email}:`, fbUser.customClaims || "none");
      } catch {
        console.log(`  Firebase claims for ${admin.email}: UNABLE TO VERIFY`);
      }
    }
  }

  console.log("\n=== Migration Complete ===");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
