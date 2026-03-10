export type AdminUserStatus = "active" | "inactive" | "banned";
export type StorageRequestStatus = "pending" | "approved" | "rejected";
export type ClientQueryStatus = "pending" | "replied" | "closed";
export type AdminLogType = "security" | "access" | "admin" | "system" | "storage";
export type AdminLogSeverity = "low" | "medium" | "high";

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  provider: "CREDENTIALS" | "GOOGLE";
  status: AdminUserStatus;
  storageUsedMb: number;
  storageLimitMb: number;
  joinedAt: Date;
  updatedAt: Date;
};

export type StorageRequestRecord = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedStorageMb: number;
  reason: string;
  status: StorageRequestStatus;
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientQueryRecord = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: ClientQueryStatus;
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminLogRecord = {
  id: string;
  type: AdminLogType;
  severity: AdminLogSeverity;
  actor: string;
  action: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: Date;
};

export type StorageConfig = {
  provider: "supabase-storage";
  bucket: string;
  totalCapacityMb: number;
  defaultUserLimitMb: number;
  maxTagsPerUpload: number;
  maxBulkUploadCount: number;
  chunkSizeMb: number;
  dedupeEnabled: boolean;
  resumeEnabled: boolean;
  hashAlgorithm: "sha256";
};

export type StorageStats = {
  usersCount: number;
  totalUsedMb: number;
  totalAllocatedMb: number;
  totalCapacityMb: number;
  freeCapacityMb: number;
  utilizationPercent: number;
  dedupeEnabled: boolean;
  resumeEnabled: boolean;
  hashAlgorithm: "sha256";
  maxTagsPerUpload: number;
};

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const users: AdminUserRecord[] = [
  {
    id: "user_01",
    name: "Alex Rivera",
    email: "alex@example.com",
    role: "USER",
    provider: "CREDENTIALS",
    status: "active",
    storageUsedMb: 12800,
    storageLimitMb: 51200,
    joinedAt: new Date(now - 150 * day),
    updatedAt: new Date(now - 2 * day),
  },
  {
    id: "user_02",
    name: "Sarah Chen",
    email: "sarah.c@corp.com",
    role: "USER",
    provider: "GOOGLE",
    status: "active",
    storageUsedMb: 4300,
    storageLimitMb: 10240,
    joinedAt: new Date(now - 120 * day),
    updatedAt: new Date(now - 1 * day),
  },
  {
    id: "user_03",
    name: "Mike Johnson",
    email: "mike.j@web.dev",
    role: "USER",
    provider: "CREDENTIALS",
    status: "banned",
    storageUsedMb: 0,
    storageLimitMb: 5120,
    joinedAt: new Date(now - 90 * day),
    updatedAt: new Date(now - 20 * day),
  },
  {
    id: "user_04",
    name: "Emma Wilson",
    email: "emma.w@design.it",
    role: "USER",
    provider: "GOOGLE",
    status: "active",
    storageUsedMb: 46000,
    storageLimitMb: 102400,
    joinedAt: new Date(now - 80 * day),
    updatedAt: new Date(now - 3 * day),
  },
  {
    id: "user_05",
    name: "Chris Lee",
    email: "chris@stack.io",
    role: "USER",
    provider: "CREDENTIALS",
    status: "inactive",
    storageUsedMb: 1200,
    storageLimitMb: 10240,
    joinedAt: new Date(now - 60 * day),
    updatedAt: new Date(now - 7 * day),
  },
];

const storageRequests: StorageRequestRecord[] = [
  {
    id: "sr_01",
    userId: "user_01",
    userName: "Alex Rivera",
    userEmail: "alex@example.com",
    requestedStorageMb: 102400,
    reason: "Need additional space for 4K video projects and raw renders.",
    status: "pending",
    createdAt: new Date(now - 18 * 60 * 1000),
    updatedAt: new Date(now - 18 * 60 * 1000),
  },
  {
    id: "sr_02",
    userId: "user_05",
    userName: "Chris Lee",
    userEmail: "chris@stack.io",
    requestedStorageMb: 20480,
    reason: "Migrating archived project assets from local NAS.",
    status: "pending",
    createdAt: new Date(now - 2 * 60 * 60 * 1000),
    updatedAt: new Date(now - 2 * 60 * 60 * 1000),
  },
];

const clientQueries: ClientQueryRecord[] = [
  {
    id: "cq_01",
    userId: "user_02",
    userName: "Sarah Chen",
    userEmail: "sarah.c@corp.com",
    subject: "Missing files after upload",
    message: "I uploaded assets yesterday but they are not visible in my Work folder.",
    status: "pending",
    createdAt: new Date(now - 35 * 60 * 1000),
    updatedAt: new Date(now - 35 * 60 * 1000),
  },
  {
    id: "cq_02",
    userId: "user_04",
    userName: "Emma Wilson",
    userEmail: "emma.w@design.it",
    subject: "Upload speed drops",
    message: "Bulk upload speed drops after ~100 files. Need guidance.",
    status: "pending",
    createdAt: new Date(now - 4 * 60 * 60 * 1000),
    updatedAt: new Date(now - 4 * 60 * 60 * 1000),
  },
];

let logs: AdminLogRecord[] = [
  {
    id: "log_01",
    type: "security",
    severity: "high",
    actor: "alex@example.com",
    action: "Failed login attempts x3",
    createdAt: new Date(now - 2 * 60 * 1000),
  },
  {
    id: "log_02",
    type: "access",
    severity: "low",
    actor: "sarah.c@corp.com",
    action: "Successful login",
    createdAt: new Date(now - 14 * 60 * 1000),
  },
  {
    id: "log_03",
    type: "storage",
    severity: "medium",
    actor: "system",
    action: "Resumable upload queue checkpoint completed",
    createdAt: new Date(now - 35 * 60 * 1000),
  },
];

let storageConfig: StorageConfig = {
  provider: "supabase-storage",
  bucket: "uploads",
  totalCapacityMb: 1024 * 1024,
  defaultUserLimitMb: 10 * 1024,
  maxTagsPerUpload: 3,
  maxBulkUploadCount: 500,
  chunkSizeMb: 8,
  dedupeEnabled: true,
  resumeEnabled: true,
  hashAlgorithm: "sha256",
};

function copyUsers(records: AdminUserRecord[]): AdminUserRecord[] {
  return records.map((record) => ({ ...record }));
}

function copyStorageRequests(records: StorageRequestRecord[]): StorageRequestRecord[] {
  return records.map((record) => ({ ...record }));
}

function copyClientQueries(records: ClientQueryRecord[]): ClientQueryRecord[] {
  return records.map((record) => ({ ...record }));
}

function copyLogs(records: AdminLogRecord[]): AdminLogRecord[] {
  return records.map((record) => ({ ...record }));
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function nextId(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${suffix}`;
}

export function listUsers(filters: {
  search?: string;
  status?: AdminUserStatus | "all";
}): AdminUserRecord[] {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  const filtered = users.filter((user) => {
    const matchesSearch =
      !normalizedSearch ||
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      !filters.status || filters.status === "all" || user.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return copyUsers(filtered);
}

export function updateUser(
  id: string,
  patch: { status?: AdminUserStatus; storageLimitMb?: number },
): { ok: true; user: AdminUserRecord } | { ok: false; error: string } {
  const user = users.find((item) => item.id === id);
  if (!user) {
    return { ok: false, error: "User not found" };
  }

  if (typeof patch.storageLimitMb === "number" && patch.storageLimitMb < user.storageUsedMb) {
    return {
      ok: false,
      error: "Storage limit cannot be smaller than current usage",
    };
  }

  if (patch.status) {
    user.status = patch.status;
  }

  if (typeof patch.storageLimitMb === "number") {
    user.storageLimitMb = patch.storageLimitMb;
  }

  user.updatedAt = new Date();

  return { ok: true, user: { ...user } };
}

export function listStorageRequests(filters: {
  search?: string;
  status?: StorageRequestStatus | "all";
}): StorageRequestRecord[] {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  const filtered = storageRequests.filter((request) => {
    const matchesSearch =
      !normalizedSearch ||
      request.userName.toLowerCase().includes(normalizedSearch) ||
      request.userEmail.toLowerCase().includes(normalizedSearch) ||
      request.reason.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      !filters.status || filters.status === "all" || request.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return copyStorageRequests(filtered).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function resolveStorageRequest(
  id: string,
  patch: {
    action: "approve" | "reject";
    adminReply?: string;
    approvedStorageMb?: number;
  },
): { ok: true; request: StorageRequestRecord; user?: AdminUserRecord } | { ok: false; error: string } {
  const request = storageRequests.find((item) => item.id === id);
  if (!request) {
    return { ok: false, error: "Storage request not found" };
  }

  if (request.status !== "pending") {
    return { ok: false, error: "Storage request already resolved" };
  }

  request.status = patch.action === "approve" ? "approved" : "rejected";
  request.adminReply = patch.adminReply;
  request.updatedAt = new Date();

  let updatedUser: AdminUserRecord | undefined;

  if (patch.action === "approve") {
    const user = users.find((item) => item.id === request.userId);
    if (user) {
      const targetLimit =
        patch.approvedStorageMb && patch.approvedStorageMb > 0
          ? patch.approvedStorageMb
          : request.requestedStorageMb;

      if (targetLimit < user.storageUsedMb) {
        return {
          ok: false,
          error: "Approved limit cannot be lower than user current usage",
        };
      }

      user.storageLimitMb = targetLimit;
      user.updatedAt = new Date();
      updatedUser = { ...user };
    }
  }

  return {
    ok: true,
    request: { ...request },
    user: updatedUser,
  };
}

export function listClientQueries(filters: {
  search?: string;
  status?: ClientQueryStatus | "all";
}): ClientQueryRecord[] {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  const filtered = clientQueries.filter((query) => {
    const matchesSearch =
      !normalizedSearch ||
      query.userName.toLowerCase().includes(normalizedSearch) ||
      query.userEmail.toLowerCase().includes(normalizedSearch) ||
      query.subject.toLowerCase().includes(normalizedSearch) ||
      query.message.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      !filters.status || filters.status === "all" || query.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return copyClientQueries(filtered).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function replyClientQuery(
  id: string,
  patch: { reply: string; close?: boolean },
): { ok: true; query: ClientQueryRecord } | { ok: false; error: string } {
  const query = clientQueries.find((item) => item.id === id);
  if (!query) {
    return { ok: false, error: "Client query not found" };
  }

  if (query.status === "closed") {
    return { ok: false, error: "Client query already closed" };
  }

  query.reply = patch.reply;
  query.status = patch.close ? "closed" : "replied";
  query.updatedAt = new Date();

  return {
    ok: true,
    query: { ...query },
  };
}

export function listLogs(filters: {
  type?: AdminLogType | "all";
  severity?: AdminLogSeverity | "all";
  limit?: number;
}): AdminLogRecord[] {
  const filtered = logs.filter((log) => {
    const matchesType = !filters.type || filters.type === "all" || log.type === filters.type;
    const matchesSeverity =
      !filters.severity || filters.severity === "all" || log.severity === filters.severity;

    return matchesType && matchesSeverity;
  });

  const sorted = copyLogs(filtered).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const limit = typeof filters.limit === "number" ? Math.max(1, Math.min(filters.limit, 200)) : 50;

  return sorted.slice(0, limit);
}

export function addLog(entry: Omit<AdminLogRecord, "id" | "createdAt">): AdminLogRecord {
  const log: AdminLogRecord = {
    ...entry,
    id: nextId("log"),
    createdAt: new Date(),
  };

  logs = [log, ...logs].slice(0, 1000);
  return { ...log };
}

export function getStorageConfig(): StorageConfig {
  return { ...storageConfig };
}

export function updateStorageConfig(
  patch: Partial<
    Pick<
      StorageConfig,
      | "bucket"
      | "totalCapacityMb"
      | "defaultUserLimitMb"
      | "maxTagsPerUpload"
      | "maxBulkUploadCount"
      | "chunkSizeMb"
      | "dedupeEnabled"
      | "resumeEnabled"
    >
  >,
): StorageConfig {
  storageConfig = {
    ...storageConfig,
    ...patch,
    maxTagsPerUpload: Math.min(Math.max(patch.maxTagsPerUpload ?? storageConfig.maxTagsPerUpload, 1), 3),
  };

  return { ...storageConfig };
}

export function getStorageStats(): StorageStats {
  const usersCount = users.length;
  const totalUsedMb = users.reduce((sum, user) => sum + user.storageUsedMb, 0);
  const totalAllocatedMb = users.reduce((sum, user) => sum + user.storageLimitMb, 0);
  const totalCapacityMb = storageConfig.totalCapacityMb;
  const freeCapacityMb = Math.max(totalCapacityMb - totalUsedMb, 0);
  const utilizationPercent = totalCapacityMb === 0 ? 0 : roundToTwo((totalUsedMb / totalCapacityMb) * 100);

  return {
    usersCount,
    totalUsedMb,
    totalAllocatedMb,
    totalCapacityMb,
    freeCapacityMb,
    utilizationPercent,
    dedupeEnabled: storageConfig.dedupeEnabled,
    resumeEnabled: storageConfig.resumeEnabled,
    hashAlgorithm: storageConfig.hashAlgorithm,
    maxTagsPerUpload: storageConfig.maxTagsPerUpload,
  };
}
