import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. SUPER ADMIN (platform owner — you, hidden) ──────────────
  const superAdmin = await prisma.admin.upsert({
    where: { email: 'super@baas.local' },
    update: {},
    create: {
      email: 'super@baas.local',
      passwordHash: await bcrypt.hash('SuperSecret123!', 10),
      isSuperAdmin: true,
    },
  });

  // ── 2. DEVELOPER ADMINS (SDK users) ────────────────────────────
  const dev1 = await prisma.admin.upsert({
    where: { email: 'dev1@rapidlink.app' },
    update: {},
    create: {
      email: 'dev1@rapidlink.app',
      passwordHash: await bcrypt.hash('Dev1Pass123!', 10),
      isSuperAdmin: false,
    },
  });

  const dev2 = await prisma.admin.upsert({
    where: { email: 'dev2@shopease.app' },
    update: {},
    create: {
      email: 'dev2@shopease.app',
      passwordHash: await bcrypt.hash('Dev2Pass123!', 10),
      isSuperAdmin: false,
    },
  });

  // ── 3. PROJECTS (one developer → many projects) ────────────────
  const rapidLink = await prisma.project.create({
    data: { name: 'RapidLink', adminId: dev1.id },
  });
  const truthCV = await prisma.project.create({
    data: { name: 'TruthCV', adminId: dev1.id },
  });
  const shopEase = await prisma.project.create({
    data: { name: 'ShopEase', adminId: dev2.id },
  });

  // ── 4. API KEYS ────────────────────────────────────────────────
  await prisma.apiKey.createMany({
    data: [
      { projectId: rapidLink.id, keyHash: 'sha256_rl_key_1' },
      { projectId: truthCV.id, keyHash: 'sha256_tcv_key_1' },
      { projectId: shopEase.id, keyHash: 'sha256_se_key_1' },
    ],
  });

  // ── 5. USERS ───────────────────────────────────────────────────
  // PROOF OF MULTI-TENANCY: the same email in two different projects
  // becomes TWO separate User rows — correct.
  const arjunRL = await prisma.user.create({
    data: {
      email: 'arjun@example.com',
      phone: '+919876543210',
      passwordHash: await bcrypt.hash('ArjunPass123!', 10),
      projectId: rapidLink.id,
    },
  });
  const arjunSE = await prisma.user.create({
    data: {
      email: 'arjun@example.com',      // ← same email
      phone: '+919876543210',          // ← same phone
      passwordHash: await bcrypt.hash('ArjunPass123!', 10),
      projectId: shopEase.id,          // ← different project → different User row
    },
  });
  const priyaRL = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      projectId: rapidLink.id,
      googleId: 'google-oauth-priya-001',
    },
  });
  const rahulSE = await prisma.user.create({
    data: {
      email: 'rahul@example.com',
      phone: '+919123456789',
      projectId: shopEase.id,
    },
  });
  const meeraTCV = await prisma.user.create({
    data: {
      email: 'meera@example.com',
      projectId: truthCV.id,
    },
  });

  // ── 6. NOTIFICATIONS ───────────────────────────────────────────
  // Every combination of status, channel, and priority so Studio
  // shows the full pipeline working.
  await prisma.notification.createMany({
    data: [
      // PENDING — IN_APP — HIGH (waiting for user's screen to turn on)
      {
        eventId: 'evt_rl_001',
        projectId: rapidLink.id,
        userId: arjunRL.id,
        channel: 'IN_APP',
        priority: 'HIGH',
        status: 'PENDING',
        title: 'Traffic cleared on Red Trail',
        body: 'ETA improved by 8 minutes',
        metadata: { routeId: 'R-99', newEta: '12 min' },
      },
      // DELIVERED — EMAIL — BULK (weekly digest sent)
      {
        eventId: 'evt_rl_002',
        projectId: rapidLink.id,
        userId: arjunRL.id,
        channel: 'EMAIL',
        priority: 'BULK',
        status: 'DELIVERED',
        title: 'Weekly driving summary',
        body: 'You drove 120 km this week',
        metadata: { km: 120, trips: 7 },
        deliveredAt: new Date(),
      },
      // READ — WHATSAPP — HIGH (user opened it)
      {
        eventId: 'evt_rl_003',
        projectId: rapidLink.id,
        userId: arjunRL.id,
        channel: 'WHATSAPP',
        priority: 'HIGH',
        status: 'READ',
        title: 'Order shipped',
        body: 'Your order ORD-99 is on its way',
        metadata: { orderId: 'ORD-99' },
        deliveredAt: new Date(),
        readAt: new Date(),
      },
      // FAILED — SMS — BULK (dead-letter example)
      {
        eventId: 'evt_rl_004',
        projectId: rapidLink.id,
        userId: priyaRL.id,
        channel: 'SMS',
        priority: 'BULK',
        status: 'FAILED',
        title: 'OTP',
        body: 'Your OTP is 4821',
        retryCount: 3,
        errorReason: 'Twilio 21610 — recipient unsubscribed',
      },
      // SAME USER in a DIFFERENT project — proof of tenant isolation
      {
        eventId: 'evt_se_001',
        projectId: shopEase.id,
        userId: arjunSE.id,
        channel: 'IN_APP',
        priority: 'HIGH',
        status: 'PENDING',
        title: 'Welcome to ShopEase',
        body: 'Your account is ready',
      },
      {
        eventId: 'evt_se_002',
        projectId: shopEase.id,
        userId: rahulSE.id,
        channel: 'EMAIL',
        priority: 'BULK',
        status: 'DELIVERED',
        title: '50% off this weekend',
        body: 'Use code WEEKEND50',
        metadata: { discount: '50%', code: 'WEEKEND50' },
        deliveredAt: new Date(),
      },
      // TruthCV — different project, different users
      {
        eventId: 'evt_tcv_001',
        projectId: truthCV.id,
        userId: meeraTCV.id,
        channel: 'EMAIL',
        priority: 'BULK',
        status: 'DELIVERED',
        title: 'Your tailored resume is ready',
        body: 'Match score: 87%',
        metadata: { matchScore: 87 },
        deliveredAt: new Date(),
      },
    ],
  });

  // ── 7. SESSIONS (login sidecars) ───────────────────────────────
  await prisma.adminSession.create({
    data: {
      adminId: dev1.id,
      refreshToken: 'refresh_admin_dev1_desktop',
      expiresAt: daysFromNow(7),
    },
  });
  await prisma.adminSession.create({
    data: {
      adminId: superAdmin.id,
      refreshToken: 'refresh_superadmin_secret',
      expiresAt: daysFromNow(1),
    },
  });
  await prisma.session.createMany({
    data: [
      {
        userId: arjunRL.id,
        refreshToken: 'refresh_user_arjun_rl_pixel8',
        expiresAt: daysFromNow(30),
      },
      {
        userId: arjunSE.id,
        refreshToken: 'refresh_user_arjun_se_pixel8',
        expiresAt: daysFromNow(30),
      },
    ],
  });

  console.log('✅ Seed complete.');
  console.log('   super@baas.local   / SuperSecret123!  (SuperAdmin)');
  console.log('   dev1@rapidlink.app / Dev1Pass123!     (Developer)');
  console.log('   dev2@shopease.app  / Dev2Pass123!     (Developer)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });