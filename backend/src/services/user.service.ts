import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  countryCode: string;
  kycStatus: string;
  kycLevel: number;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFaEnabled: boolean;
  twoFaSecret?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  country_code: string;
  kyc_status: string;
  kyc_level: number;
  is_active: number;
  email_verified: number;
  phone_verified: number;
  two_fa_enabled: number;
  two_fa_secret: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    countryCode: row.country_code,
    kycStatus: row.kyc_status,
    kycLevel: row.kyc_level,
    isActive: !!row.is_active,
    emailVerified: !!row.email_verified,
    phoneVerified: !!row.phone_verified,
    twoFaEnabled: !!row.two_fa_enabled,
    twoFaSecret: row.two_fa_secret,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UserService {
  async findByEmail(email: string): Promise<User | null> {
    const row = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.toLowerCase()) as unknown as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as
      | UserRow
      | undefined;
    return row ? rowToUser(row) : null;
  }

  async create(input: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    countryCode: string;
    kycStatus: string;
    kycLevel: number;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
  }): Promise<User> {
    const id = uuidv4();
    db.prepare(
      `INSERT INTO users
        (id, email, password_hash, first_name, last_name, phone, country_code,
         kyc_status, kyc_level, is_active, email_verified, phone_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      input.email.toLowerCase(),
      input.passwordHash,
      input.firstName,
      input.lastName,
      input.phone ?? null,
      input.countryCode,
      input.kycStatus,
      input.kycLevel,
      input.isActive ? 1 : 0,
      input.emailVerified ? 1 : 0,
      input.phoneVerified ? 1 : 0
    );
    return (await this.findById(id))!;
  }

  async updateLastLogin(id: string): Promise<void> {
    db.prepare("UPDATE users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(
      id
    );
  }

  async updateTwoFaSecret(id: string, secret: string): Promise<void> {
    db.prepare("UPDATE users SET two_fa_secret = ?, updated_at = datetime('now') WHERE id = ?").run(
      secret,
      id
    );
  }

  async enableTwoFa(id: string): Promise<void> {
    db.prepare(
      "UPDATE users SET two_fa_enabled = 1, updated_at = datetime('now') WHERE id = ?"
    ).run(id);
  }
}
