# TypeORM Relationships Guide

A comprehensive guide to understanding TypeORM relationships with practical examples from this NestJS project.

---

## Table of Contents

### 1. [PostgreSQL Keys & Constraints](#postgresql-keys--constraints)
- [Primary Key (PK)](#1-primary-key-pk)
- [Foreign Key (FK)](#2-foreign-key-fk)
- [Unique Constraint](#3-unique-constraint)
- [Not Null Constraint](#4-not-null-constraint)
- [Check Constraint](#5-check-constraint)
- [Default Value](#6-default-value)
- [Enum Constraint](#7-enum-constraint)
- [Indexes](#8-indexes)
- [Special TypeORM Decorators](#9-special-typeorm-decorators)
- [Best Practices](#best-practices)

### 2. [One-to-One Relationship](#one-to-one-relationship)
- [Example: User ↔ Profile](#example-user--profile)
- [Database Schema](#database-schema)
- [Entity Configuration](#entity-configuration)
- [Understanding Cascade Operations](#understanding-cascade-operations)
- [Best Practices](#best-practices-1)
- [Loading Relations](#loading-relations)
- [Generated SQL Queries](#generated-sql-queries)
- [Common Issues & Solutions](#common-issues--solutions)
- [Decision Guide: Where to Put @JoinColumn?](#decision-guide-where-to-put-joincolumn)
- [Complete Working Example](#complete-working-example)

### 3. [One-to-Many / Many-to-One](#one-to-many--many-to-one)
- [Example: User ↔ Tweets](#example-user--tweets)
- [Database Schema](#database-schema-1)
- [Understanding the Relationship](#understanding-the-relationship)
- [Entity Configuration](#entity-configuration-1)
- [Critical Rules](#critical-rules)
- [Cascade Operations for One-to-Many](#cascade-operations-for-one-to-many)
- [Loading Strategies](#loading-strategies)
- [**🎯 Comprehensive Guide: Loading Relations & Joins**](#-comprehensive-guide-loading-relations--joins)
  - [The Fundamental Rule](#-the-fundamental-rule)
  - [WHEN to Explicitly Load Relations](#-when-to-explicitly-load-relations)
  - [WHY You Need to Explicitly Load](#-why-you-need-to-explicitly-load)
  - [WHERE to Add Relations](#-where-to-add-relations)
  - [Nested Relations](#-nested-relations)
  - [Performance Considerations](#-performance-considerations)
  - [Common Mistakes & Solutions](#-common-mistakes--solutions)
  - [Quick Decision Matrix](#-quick-decision-matrix-1)
  - [Best Practices Summary](#-best-practices-summary)
- [Foreign Key Indexing & Performance](#foreign-key-indexing--performance)
- [Generated SQL Queries](#generated-sql-queries-1)
- [Best Practices](#best-practices-2)
- [Common Issues & Solutions](#common-issues--solutions-1)
- [Complete Working Example](#complete-working-example-1)
- [Decision Guide](#decision-guide)
- [Real-World NestJS Implementation](#real-world-nestjs-implementation)
  - [Entity Definitions](#1-entity-definitions)
  - [DTO Definitions](#2-dto-definitions)
  - [Service Implementation](#3-service-implementation)
  - [Controller Implementation](#4-controller-implementation)
  - [Module Configuration](#5-module-configuration)
- [Common Patterns & Best Practices](#common-patterns--best-practices)
- [Testing Examples](#testing-examples)
- [**Key Concepts: What to Remember & What NOT to Do** 🎯](#key-concepts-what-to-remember--what-not-to-do)
  - [✅ MUST REMEMBER (10 Essential Rules)](#-must-remember)
  - [❌ COMMON MISTAKES TO AVOID (5 Critical Pitfalls)](#-common-mistakes-to-avoid)
  - [🎯 Your Implementation Analysis](#-your-current-implementation-analysis)
  - [📊 Quick Decision Matrix](#-quick-decision-matrix)
- [Quick Reference Checklist](#quick-reference-checklist)

### 4. [Many-to-Many](#many-to-many)
- [Example: Tweet ↔ Hashtags (Unidirectional)](#example-tweet--hashtags-unidirectional)
- [Database Schema](#database-schema-2)
- [Understanding the Relationship](#understanding-the-relationship-1)
- [Entity Configuration](#entity-configuration-2)
- [Critical Rules for Many-to-Many](#critical-rules-for-many-to-many)
- [Cascade Operations](#cascade-operations)
- [Loading Relations](#loading-relations-1)
- [Complete Working Example](#complete-working-example-2)
- [Bidirectional Many-to-Many (Optional)](#bidirectional-many-to-many-optional)
- [Best Practices](#best-practices-3)
- [Quick Reference Checklist](#quick-reference-checklist-1)

### 5. [Additional Resources](#additional-resources)

---

## PostgreSQL Keys & Constraints

Understanding database keys and constraints is fundamental to designing robust database schemas. This section covers all PostgreSQL constraint types and how to implement them with TypeORM.

---

### 1. Primary Key (PK)

A primary key uniquely identifies each row in a table. Every table should have exactly one primary key.

#### Characteristics:
- Must contain unique values
- Cannot contain NULL values
- Only one primary key per table
- Automatically creates an index
- Can be single column or composite (multiple columns)

#### TypeORM Implementation:

##### Single Column Primary Key (UUID)

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;  // Generates UUID automatically
}
```

**Generated SQL:**
```sql
CREATE TABLE "user" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
)
```

##### Single Column Primary Key (Auto-increment)

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn('increment')  // or just @PrimaryGeneratedColumn()
  id: number;  // Auto-incrementing integer
}
```

**Generated SQL:**
```sql
CREATE TABLE "product" (
  "id" SERIAL NOT NULL,
  CONSTRAINT "PK_product_id" PRIMARY KEY ("id")
)
```

##### Manual Primary Key

```typescript
@Entity()
export class Config {
  @PrimaryColumn()
  key: string;  // You provide the value manually
}
```

##### Composite Primary Key

```typescript
@Entity()
export class UserRole {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  roleId: string;

  // Both columns together form the primary key
}
```

**Generated SQL:**
```sql
CREATE TABLE "user_role" (
  "userId" varchar NOT NULL,
  "roleId" varchar NOT NULL,
  CONSTRAINT "PK_user_role" PRIMARY KEY ("userId", "roleId")
)
```

---

### 2. Foreign Key (FK)

A foreign key creates a link between two tables, ensuring referential integrity. The foreign key in one table points to a primary key in another table.

#### Characteristics:
- Must reference a primary key or unique column in another table
- Can contain NULL values (unless marked NOT NULL)
- Can have ON DELETE and ON UPDATE actions
- Enforces referential integrity

#### TypeORM Implementation:

##### Basic Foreign Key

```typescript
@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()  // Creates foreign key column
  user: User;
}
```

**Generated SQL:**
```sql
CREATE TABLE "profile" (
  "id" uuid NOT NULL,
  "userId" uuid,
  CONSTRAINT "FK_profile_user" FOREIGN KEY ("userId")
    REFERENCES "user"("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
```

##### Foreign Key with CASCADE

```typescript
@Entity()
export class Profile {
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',   // Delete profile when user is deleted
    onUpdate: 'CASCADE',   // Update userId when user.id changes
  })
  @JoinColumn()
  user: User;
}
```

**Generated SQL:**
```sql
CONSTRAINT "FK_profile_user" FOREIGN KEY ("userId")
  REFERENCES "user"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

#### Foreign Key Actions:

| Action | Behavior | Use Case |
|--------|----------|----------|
| `CASCADE` | Automatically delete/update child rows | Delete profile when user is deleted |
| `SET NULL` | Set foreign key to NULL | Set orderId to NULL when order is deleted |
| `SET DEFAULT` | Set foreign key to default value | Rarely used |
| `RESTRICT` | Prevent parent deletion if children exist | Can't delete category if products exist |
| `NO ACTION` | Same as RESTRICT (default) | Default behavior |

**Example: All Actions**
```typescript
// CASCADE - Child deleted with parent
@ManyToOne(() => User, { onDelete: 'CASCADE' })
profile: User;

// SET NULL - Child's FK set to null
@ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
order: Order;

// RESTRICT - Can't delete parent if children exist
@ManyToOne(() => Category, { onDelete: 'RESTRICT' })
category: Category;
```

---

### 3. Unique Constraint

Ensures that all values in a column (or combination of columns) are unique across the table.

#### Characteristics:
- Allows NULL values (multiple NULLs are allowed)
- Can have multiple unique constraints per table
- Automatically creates an index
- Can be single column or composite

#### TypeORM Implementation:

##### Single Column Unique

```typescript
@Entity()
export class User {
  @Column({ unique: true })
  email: string;  // No two users can have the same email

  @Column({ unique: true })
  username: string;  // No two users can have the same username
}
```

**Generated SQL:**
```sql
CREATE TABLE "user" (
  "email" varchar NOT NULL,
  "username" varchar NOT NULL,
  CONSTRAINT "UQ_user_email" UNIQUE ("email"),
  CONSTRAINT "UQ_user_username" UNIQUE ("username")
)
```

##### Composite Unique Constraint

```typescript
@Entity()
@Unique(['firstName', 'lastName'])  // Combination must be unique
export class Person {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // Same name is ok, but not same firstName + lastName combination
}
```

**Generated SQL:**
```sql
CREATE TABLE "person" (
  "firstName" varchar NOT NULL,
  "lastName" varchar NOT NULL,
  CONSTRAINT "UQ_person_firstName_lastName" UNIQUE ("firstName", "lastName")
)
```

##### Multiple Composite Unique Constraints

```typescript
@Entity()
@Unique('UQ_email_active', ['email', 'isActive'])
@Unique('UQ_username_tenant', ['username', 'tenantId'])
export class User {
  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  tenantId: string;

  @Column()
  isActive: boolean;
}
```

---

### 4. Not Null Constraint

Ensures that a column cannot have NULL values.

#### TypeORM Implementation:

```typescript
@Entity()
export class User {
  @Column({ nullable: false })  // NOT NULL (default)
  email: string;

  @Column({ nullable: true })   // Allows NULL
  middleName: string;

  @Column()  // NOT NULL by default
  username: string;
}
```

**Generated SQL:**
```sql
CREATE TABLE "user" (
  "email" varchar NOT NULL,
  "middleName" varchar NULL,
  "username" varchar NOT NULL
)
```

---

### 5. Check Constraint

Ensures that values in a column satisfy a specific condition.

#### TypeORM Implementation:

```typescript
@Entity()
@Check('"age" >= 18')  // Age must be 18 or older
@Check('"salary" > 0')  // Salary must be positive
export class Employee {
  @Column()
  age: number;

  @Column()
  salary: number;
}
```

**Generated SQL:**
```sql
CREATE TABLE "employee" (
  "age" int NOT NULL,
  "salary" numeric NOT NULL,
  CONSTRAINT "CHK_employee_age" CHECK ("age" >= 18),
  CONSTRAINT "CHK_employee_salary" CHECK ("salary" > 0)
)
```

#### Advanced Check Constraints

```typescript
@Entity()
@Check('"startDate" < "endDate"')  // Start must be before end
@Check('"status" IN (\'active\', \'inactive\', \'pending\')')
export class Campaign {
  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  status: string;
}
```

---

### 6. Default Value

Specifies a default value for a column when no value is provided during INSERT.

#### TypeORM Implementation:

```typescript
@Entity()
export class User {
  @Column({ default: true })
  isActive: boolean;  // Defaults to true

  @Column({ default: 0 })
  loginCount: number;  // Defaults to 0

  @Column({ default: 'user' })
  role: string;  // Defaults to 'user'

  @CreateDateColumn()  // Defaults to CURRENT_TIMESTAMP
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  registeredAt: Date;
}
```

**Generated SQL:**
```sql
CREATE TABLE "user" (
  "isActive" boolean NOT NULL DEFAULT true,
  "loginCount" int NOT NULL DEFAULT 0,
  "role" varchar NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "registeredAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

---

### 7. Enum Constraint

Restricts column values to a predefined set of values.

#### TypeORM Implementation:

```typescript
// Define enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity()
export class User {
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;
}
```

**Generated SQL:**
```sql
CREATE TYPE "user_role_enum" AS ENUM('admin', 'user', 'moderator');
CREATE TYPE "gender_enum" AS ENUM('male', 'female', 'other');

CREATE TABLE "user" (
  "role" "user_role_enum" NOT NULL DEFAULT 'user',
  "gender" "gender_enum" NULL
)
```

---

### 8. Indexes

Indexes improve query performance by creating a data structure that allows fast lookups.

#### Types of Indexes:

##### Simple Index

```typescript
@Entity()
export class User {
  @Index()  // Creates index on email
  @Column()
  email: string;

  @Index('IDX_username')  // Named index
  @Column()
  username: string;
}
```

##### Composite Index

```typescript
@Entity()
@Index(['firstName', 'lastName'])  // Index on combination
@Index('IDX_name_age', ['firstName', 'age'])  // Named composite index
export class Person {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;
}
```

##### Unique Index

```typescript
@Entity()
export class User {
  @Index({ unique: true })
  @Column()
  email: string;
}
```

##### Full-Text Search Index

```typescript
@Entity()
@Index('IDX_post_fulltext', ['title', 'content'], {
  fulltext: true,
  parser: 'english'  // PostgreSQL full-text search
})
export class Post {
  @Column()
  title: string;

  @Column('text')
  content: string;
}
```

##### Partial Index (with WHERE clause)

```typescript
@Entity()
@Index('IDX_active_users', ['email'], {
  where: '"isActive" = true'  // Only index active users
})
export class User {
  @Column()
  email: string;

  @Column()
  isActive: boolean;
}
```

**Generated SQL:**
```sql
CREATE INDEX "IDX_active_users" ON "user"("email")
WHERE "isActive" = true
```

---

### 9. Special TypeORM Decorators

#### Timestamps

```typescript
@Entity()
export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;  // Automatically set on INSERT

  @UpdateDateColumn()
  updatedAt: Date;  // Automatically updated on UPDATE
}
```

#### Soft Delete

```typescript
@Entity()
export class User {
  @DeleteDateColumn()
  deletedAt: Date;  // Set when soft-deleted, NULL otherwise
}

// Usage
await userRepository.softDelete({ id: userId });  // Sets deletedAt
await userRepository.restore({ id: userId });     // Sets deletedAt to NULL
```

#### Version Column (Optimistic Locking)

```typescript
@Entity()
export class Product {
  @VersionColumn()
  version: number;  // Automatically incremented on UPDATE
}
```

---

### Complete Example with All Constraints

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
  Unique,
  Check,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Unique(['email'])  // Unique constraint
@Unique('UQ_username_tenant', ['username', 'tenantId'])  // Composite unique
@Check('"age" >= 18')  // Check constraint
@Check('"salary" > 0')
@Index(['lastName', 'firstName'])  // Composite index
@Index('IDX_active', ['isActive'], { where: '"deletedAt" IS NULL' })  // Partial index
export class User {
  // Primary Key
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unique columns
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Index()  // Simple index
  @Column({ type: 'varchar', length: 50 })
  username: string;

  // Not Null with default
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Nullable column
  @Column({ type: 'varchar', length: 50, nullable: true })
  middleName: string;

  // Enum column
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  // Check constraint columns
  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  // Foreign Key
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  @Column()
  tenantId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Version for optimistic locking
  @VersionColumn()
  version: number;
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
```

**Generated SQL:**
```sql
CREATE TYPE "user_role_enum" AS ENUM('admin', 'user');
CREATE TYPE "user_status_enum" AS ENUM('active', 'inactive', 'suspended');

CREATE TABLE "organizations" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" varchar NOT NULL,
  CONSTRAINT "PK_organizations" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_organizations_name" UNIQUE ("name")
);

CREATE TABLE "users" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "email" varchar(100) NOT NULL,
  "username" varchar(50) NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "middleName" varchar(50) NULL,
  "role" "user_role_enum" NOT NULL DEFAULT 'user',
  "status" "user_status_enum" NOT NULL DEFAULT 'active',
  "age" int NOT NULL,
  "salary" decimal(10,2) NOT NULL,
  "organizationId" uuid NOT NULL,
  "tenantId" varchar NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP NULL,
  "version" int NOT NULL DEFAULT 1,

  CONSTRAINT "PK_users" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_users_email" UNIQUE ("email"),
  CONSTRAINT "UQ_username_tenant" UNIQUE ("username", "tenantId"),
  CONSTRAINT "CHK_users_age" CHECK ("age" >= 18),
  CONSTRAINT "CHK_users_salary" CHECK ("salary" > 0),
  CONSTRAINT "FK_users_organization" FOREIGN KEY ("organizationId")
    REFERENCES "organizations"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_users_username" ON "users"("username");
CREATE INDEX "IDX_users_lastName_firstName" ON "users"("lastName", "firstName");
CREATE INDEX "IDX_active" ON "users"("isActive") WHERE "deletedAt" IS NULL;
```

---

### Constraint Comparison Table

| Constraint | Purpose | Multiple per Table | Allows NULL | Creates Index | TypeORM Decorator |
|------------|---------|-------------------|-------------|---------------|-------------------|
| Primary Key | Unique identifier | No (only 1) | No | Yes (automatic) | `@PrimaryGeneratedColumn()` |
| Foreign Key | Link between tables | Yes | Yes* | No | `@JoinColumn()` |
| Unique | Prevent duplicates | Yes | Yes | Yes (automatic) | `@Column({ unique: true })` |
| Not Null | Require values | Yes (all columns) | N/A | No | `@Column({ nullable: false })` |
| Check | Validate data | Yes | Yes | No | `@Check()` |
| Default | Set default value | Yes (all columns) | N/A | No | `@Column({ default: value })` |
| Index | Speed up queries | Yes | N/A | N/A | `@Index()` |

*Foreign keys can be NULL if `nullable: true` is set

---

### Best Practices

#### ✅ Do This:

1. **Always have a Primary Key**
   ```typescript
   @PrimaryGeneratedColumn('uuid')
   id: string;
   ```

2. **Use UUIDs for distributed systems**
   ```typescript
   // Better for microservices, no collision risk
   @PrimaryGeneratedColumn('uuid')
   ```

3. **Add indexes on foreign keys**
   ```typescript
   @Index()
   @Column()
   userId: string;
   ```

4. **Use enums for fixed sets of values**
   ```typescript
   @Column({ type: 'enum', enum: Status })
   status: Status;
   ```

5. **Add unique constraints on natural keys**
   ```typescript
   @Column({ unique: true })
   email: string;
   ```

6. **Use timestamps for auditing**
   ```typescript
   @CreateDateColumn()
   createdAt: Date;

   @UpdateDateColumn()
   updatedAt: Date;
   ```

#### ❌ Avoid This:

1. **Don't create indexes on every column**
   - Indexes slow down INSERT/UPDATE operations
   - Only index frequently queried columns

2. **Don't use composite keys unless necessary**
   - Harder to reference from other tables
   - More complex queries

3. **Don't forget foreign key actions**
   ```typescript
   // Bad - no onDelete specified
   @ManyToOne(() => User)
   user: User;

   // Good
   @ManyToOne(() => User, { onDelete: 'CASCADE' })
   user: User;
   ```

4. **Don't over-constrain**
   - Balance between data integrity and flexibility
   - Some validations better in application layer

---

## One-to-One Relationship

### Example: User ↔ Profile

A User has exactly one Profile, and a Profile belongs to exactly one User.

### Database Schema

```
┌─────────────────┐         ┌─────────────────┐
│  User Table     │         │  Profile Table  │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │←────────│ userId (FK)     │
│ email           │         │ id (PK)         │
│ username        │         │ firstName       │
│ password        │         │ lastName        │
│ createdAt       │         │ gender          │
│ updatedAt       │         │ dob             │
│ deletedAt       │         │ createdAt       │
└─────────────────┘         └─────────────────┘
```

**Key Point**: Profile table contains the foreign key (`userId`), making it the **owning side**.

---

### Entity Configuration

#### Owning Side (Profile Entity)

The entity with `@JoinColumn()` is the owning side and contains the foreign key.

```typescript
// src/app/profile/entities/profile.entity.ts
import { User } from 'src/app/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  lastName: string;

  // Owning side of the relationship
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',  // Database-level cascade delete
  })
  @JoinColumn()  // Creates userId foreign key column in Profile table
  user: User;
}
```

**Key Configuration:**
- `@JoinColumn()` - Creates the foreign key column in this table
- `onDelete: 'CASCADE'` - When User is deleted, Profile is automatically deleted (database-level)
- `(user) => user.profile` - Specifies the inverse relation property

---

#### Inverse Side (User Entity)

The entity without `@JoinColumn()` is the inverse side.

```typescript
// src/app/users/entities/user.entity.ts
import { Profile } from 'src/app/profile/entities/profile.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '30', unique: true })
  email: string;

  @Column({ type: 'varchar', length: '40', unique: true })
  username: string;

  // Inverse side of the relationship
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['insert', 'update'],  // Application-level cascade operations
  })
  profile: Profile;
}
```

**Key Configuration:**
- NO `@JoinColumn()` - This entity doesn't contain the foreign key
- `cascade: ['insert', 'update']` - Application-level cascade operations
- `(profile) => profile.user` - Specifies the owning relation property

---

### Understanding Cascade Operations

**Cascade** refers to the automatic propagation of operations from a parent entity to its related child entities. Think of it like a domino effect - when you perform an action on the parent, the same (or related) action automatically happens to the children.

There are **two distinct levels** where cascading can occur:
1. **Database-Level Cascade** - Enforced by the database itself via foreign key constraints
2. **Application-Level Cascade** - Handled by TypeORM in your Node.js application

---

#### 1. Database-Level Cascade (Foreign Key Actions)

Database-level cascades are configured using `onDelete` and `onUpdate` options in TypeORM, which translate to PostgreSQL foreign key constraints.

##### Definition

When a foreign key constraint is created with CASCADE actions, the database **automatically** performs the specified action on child rows when the parent row is modified or deleted.

##### Configuration

```typescript
@Entity()
export class Profile {
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',   // When User is deleted → delete Profile
    onUpdate: 'CASCADE',   // When User.id changes → update Profile.userId
  })
  @JoinColumn()  // Profile owns the relationship (has the FK)
  user: User;
}
```

**Generated Foreign Key Constraint:**
```sql
CONSTRAINT "FK_profile_user" FOREIGN KEY ("userId")
  REFERENCES "user"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

##### How It Works

```
Step 1: Application sends DELETE command
┌─────────────────────────────────────┐
│ DELETE FROM user WHERE id = 'abc'  │
└─────────────────────────────────────┘
                 ↓
Step 2: Database executes the delete
┌─────────────────────────────────────┐
│ User (id: 'abc') is deleted         │
└─────────────────────────────────────┘
                 ↓
Step 3: Database checks FK constraints
┌─────────────────────────────────────┐
│ Found FK: profile.userId → user.id  │
│ Action: ON DELETE CASCADE           │
└─────────────────────────────────────┘
                 ↓
Step 4: Database auto-executes cascade
┌─────────────────────────────────────┐
│ DELETE FROM profile                 │
│ WHERE userId = 'abc'                │
└─────────────────────────────────────┘
                 ↓
Step 5: Both records deleted ✅
```

##### Available Database-Level Actions

| Action | TypeORM Option | Behavior | Use Case |
|--------|---------------|----------|----------|
| **CASCADE** | `onDelete: 'CASCADE'` | Automatically delete child when parent is deleted | User deleted → Profile deleted |
| **SET NULL** | `onDelete: 'SET NULL'` | Set foreign key to NULL when parent is deleted | Order deleted → OrderItem.orderId = NULL |
| **SET DEFAULT** | `onDelete: 'SET DEFAULT'` | Set foreign key to default value | Rarely used in practice |
| **RESTRICT** | `onDelete: 'RESTRICT'` | Prevent parent deletion if children exist | Can't delete Category if Products exist |
| **NO ACTION** | `onDelete: 'NO ACTION'` | Same as RESTRICT (PostgreSQL default) | Default behavior |

##### Example: All Actions

```typescript
// CASCADE - Child deleted with parent
@Entity()
export class Profile {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}

// SET NULL - Foreign key set to null (must be nullable!)
@Entity()
export class Order {
  @ManyToOne(() => Customer, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  customer: Customer;
}

// RESTRICT - Prevents deletion if children exist
@Entity()
export class Product {
  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn()
  category: Category;
}
// Trying to delete category will fail with:
// ERROR: update or delete on table "category" violates foreign key constraint
```

##### Key Characteristics

✅ **Pros:**
- **Reliability** - Enforced at database level, works even with raw SQL
- **Performance** - Database handles it natively, very fast
- **Data Integrity** - Guaranteed by the database engine
- **Transaction Safety** - Rolled back if any part fails
- **Works Everywhere** - Any application accessing the database

❌ **Cons:**
- **Limited to DELETE/UPDATE** - Doesn't handle INSERT operations
- **No Application Logic** - Can't run custom code before cascade
- **Database-Specific** - Behavior may vary between databases

##### Real-World Example

```typescript
// Scenario: Social Media App
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  author: User;
}

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;
}

// What happens when a user is deleted?
await userRepository.delete({ id: userId });

// Database automatically:
// 1. Deletes User
// 2. Finds all Posts where author = userId
// 3. Deletes all those Posts (CASCADE)
// 4. Finds all Comments where post IN (deleted posts)
// 5. Deletes all those Comments (CASCADE)
// All in a single transaction!
```

---

#### 2. Application-Level Cascade (TypeORM Cascade Options)

Application-level cascades are configured using the `cascade` option in relationship decorators. TypeORM handles these operations in your Node.js application **before** sending queries to the database.

##### Definition

When you save/update/delete an entity through TypeORM, the cascade options tell TypeORM to automatically perform the same operation on related entities loaded in memory.

##### Configuration

```typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['insert', 'update'],  // TypeORM handles these
    // cascade: true,  // Alternative: enables all cascade operations
  })
  profile: Profile;
}
```

##### How It Works

```
Step 1: Application creates entity with relation
┌─────────────────────────────────────────────┐
│ const user = userRepository.create({        │
│   email: 'test@example.com',                │
│   profile: { firstName: 'John' }            │
│ });                                         │
└─────────────────────────────────────────────┘
                 ↓
Step 2: Application calls save()
┌─────────────────────────────────────────────┐
│ await userRepository.save(user);            │
└─────────────────────────────────────────────┘
                 ↓
Step 3: TypeORM checks cascade options
┌─────────────────────────────────────────────┐
│ Found: cascade: ['insert', 'update']        │
│ Action: Save related profile too            │
└─────────────────────────────────────────────┘
                 ↓
Step 4: TypeORM generates multiple queries
┌─────────────────────────────────────────────┐
│ START TRANSACTION                            │
│ INSERT INTO user (...) VALUES (...)         │
│ INSERT INTO profile (..., userId) VALUES ..│
│ COMMIT                                       │
└─────────────────────────────────────────────┘
                 ↓
Step 5: Both entities saved ✅
```

##### Available Application-Level Cascade Options

| Option | When It Triggers | What It Does | Example |
|--------|------------------|--------------|---------|
| **'insert'** | `repository.save()` on new entity | Auto-saves new related entities | Creating user with nested profile |
| **'update'** | `repository.save()` on existing entity | Auto-saves changes to related entities | Updating user and profile together |
| **'remove'** | `repository.remove()` | Hard deletes related entities | Deleting user removes profile |
| **'soft-remove'** | `repository.softRemove()` | Sets `deletedAt` on related entities | Soft-deleting user soft-deletes profile |
| **'recover'** | `repository.recover()` | Clears `deletedAt` on related entities | Recovering user recovers profile |
| **true** | All operations | Enables all of the above | Shorthand for complete cascade |

##### Detailed Examples

###### 1. cascade: ['insert'] - Auto-Save on Create

```typescript
// Entity configuration
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['insert'],  // ← Enables insert cascade
  })
  profile: Profile;
}

// Usage - WITHOUT cascade
const profile = profileRepository.create({ firstName: 'John' });
await profileRepository.save(profile);  // Must save manually first

const user = userRepository.create({ email: 'test@example.com' });
user.profile = profile;
await userRepository.save(user);

// Usage - WITH cascade: ['insert']
const user = userRepository.create({
  email: 'test@example.com',
  profile: {  // Nested object
    firstName: 'John',
    lastName: 'Doe'
  }
});
await userRepository.save(user);
// ✅ Both user and profile saved automatically!

// Generated SQL:
// START TRANSACTION
// INSERT INTO "user" ("email") VALUES ($1) RETURNING "id"
// INSERT INTO "profile" ("firstName", "lastName", "userId") VALUES ($1, $2, $3)
// COMMIT
```

###### 2. cascade: ['update'] - Auto-Save on Update

```typescript
// Entity configuration
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['update'],  // ← Enables update cascade
  })
  profile: Profile;
}

// Usage - WITHOUT cascade
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['profile']
});

user.email = 'newemail@example.com';
user.profile.firstName = 'Jane';

await userRepository.save(user);  // Only saves user
await profileRepository.save(user.profile);  // Must save profile separately

// Usage - WITH cascade: ['update']
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['profile']
});

user.email = 'newemail@example.com';
user.profile.firstName = 'Jane';  // Modify nested profile

await userRepository.save(user);
// ✅ Both user and profile updated automatically!

// Generated SQL:
// START TRANSACTION
// UPDATE "user" SET "email" = $1 WHERE "id" = $2
// UPDATE "profile" SET "firstName" = $1 WHERE "id" = $2
// COMMIT
```

###### 3. cascade: ['remove'] - Auto-Delete on Remove

```typescript
// Entity configuration
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['remove'],  // ← Enables remove cascade
  })
  profile: Profile;
}

// Usage
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['profile']  // Must load relation!
});

await userRepository.remove(user);
// ✅ Both user and profile deleted!

// Generated SQL:
// START TRANSACTION
// DELETE FROM "profile" WHERE "id" = $1
// DELETE FROM "user" WHERE "id" = $2
// COMMIT

// ⚠️ GOTCHA: Relation must be loaded in memory!
// This WON'T cascade:
const user = await userRepository.findOne({
  where: { id: userId }
  // relations not loaded!
});
await userRepository.remove(user);  // Only deletes user
```

###### 4. cascade: ['soft-remove'] - Auto Soft-Delete

```typescript
// Entity configuration
@Entity()
export class User {
  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['soft-remove'],  // ← Enables soft-remove cascade
  })
  profile: Profile;
}

@Entity()
export class Profile {
  @DeleteDateColumn()
  deletedAt: Date;
}

// Usage
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['profile']
});

await userRepository.softRemove(user);
// ✅ Sets deletedAt on both user and profile!

// Generated SQL:
// START TRANSACTION
// UPDATE "profile" SET "deletedAt" = NOW() WHERE "id" = $1
// UPDATE "user" SET "deletedAt" = NOW() WHERE "id" = $2
// COMMIT
```

###### 5. cascade: true - Enable All Operations

```typescript
// Entity configuration
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,  // ← Enables ALL cascade operations
  })
  profile: Profile;
}

// Equivalent to:
// cascade: ['insert', 'update', 'remove', 'soft-remove', 'recover']
```

##### Key Characteristics

✅ **Pros:**
- **Convenience** - Less boilerplate code for CRUD operations
- **Flexible** - Can run application logic before/after cascade
- **INSERT Support** - Works for creating nested entities
- **Type-Safe** - TypeScript validates nested objects

❌ **Cons:**
- **Memory Required** - Relations must be loaded in memory to cascade
- **Performance** - Multiple queries vs single database CASCADE
- **Application-Only** - Doesn't work with raw SQL queries
- **Easy to Forget** - Must remember to load relations

##### Common Pitfalls

**❌ Pitfall 1: Forgetting to Load Relations**

```typescript
// This WON'T cascade remove the profile!
const user = await userRepository.findOne({
  where: { id: userId }
  // ❌ Missing: relations: ['profile']
});
await userRepository.remove(user);
// Only user is deleted, profile remains orphaned!

// ✅ Correct way:
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['profile']  // ✅ Load the relation
});
await userRepository.remove(user);
// Both user and profile deleted
```

**❌ Pitfall 2: Using Both Database and Application CASCADE**

```typescript
// ⚠️ Problematic configuration
@Entity()
export class Profile {
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',  // Database-level
  })
  @JoinColumn()
  user: User;
}

@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['remove'],  // Application-level
  })
  profile: Profile;
}

// When deleting user:
// 1. TypeORM tries to delete profile (application cascade)
// 2. Database also tries to delete profile (FK cascade)
// 3. Can cause errors or double-delete attempts

// ✅ Better: Use only one approach
@Entity()
export class Profile {
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',  // Use database cascade for deletes
  })
  @JoinColumn()
  user: User;
}

@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['insert', 'update'],  // Use app cascade for creates/updates
  })
  profile: Profile;
}
```

**❌ Pitfall 3: Cascade on Nullable Relations**

```typescript
@Entity()
export class Order {
  @ManyToOne(() => Customer, (customer) => customer.orders, {
    onDelete: 'CASCADE',  // ❌ Wrong!
    nullable: true
  })
  customer: Customer;
}

// Problem: If customer is deleted, orders cascade-delete too
// But orders might be valuable historical data!

// ✅ Better: Use SET NULL for optional relations
@Entity()
export class Order {
  @ManyToOne(() => Customer, (customer) => customer.orders, {
    onDelete: 'SET NULL',  // ✅ Correct!
    nullable: true
  })
  customer: Customer;
}
```

---

#### Comparison: Database vs Application Cascade

| Aspect | Database-Level (`onDelete`) | Application-Level (`cascade`) |
|--------|---------------------------|------------------------------|
| **Triggered By** | Direct database operations | TypeORM repository methods |
| **Works With** | Raw SQL, any ORM, external apps | Only TypeORM operations |
| **Requires Loading** | No - database handles it | Yes - must load relations |
| **Performance** | Fast - single operation | Slower - multiple queries |
| **Operations** | DELETE, UPDATE only | INSERT, UPDATE, DELETE, SOFT-DELETE, RECOVER |
| **Transaction** | Single atomic operation | Multiple operations in transaction |
| **Use Case** | Referential integrity | Convenience in application code |

---

#### Best Practice Recommendations

**✅ Recommended Pattern:**

```typescript
// Profile (Owning Side) - Database handles deletions
@Entity()
export class Profile {
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',  // Database-level for deletes
    onUpdate: 'CASCADE',  // Database-level for updates
  })
  @JoinColumn()
  user: User;
}

// User (Inverse Side) - Application handles creates/updates
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['insert', 'update'],  // App-level convenience
  })
  profile: Profile;
}
```

**Why This Pattern?**

1. **Deletes via Database** - More reliable, faster, works everywhere
2. **Creates/Updates via Application** - Convenient for nested saves
3. **No Conflicts** - Each level handles different operations
4. **Best of Both Worlds** - Reliability + Convenience

**Decision Tree:**

```
Do you need to automatically handle related entities?
│
├─ YES → Which operation?
│   │
│   ├─ DELETE/UPDATE?
│   │   └─ Use: onDelete: 'CASCADE' / onUpdate: 'CASCADE'
│   │      (Database-level, on owning side)
│   │
│   └─ INSERT/UPDATE with nested objects?
│       └─ Use: cascade: ['insert', 'update']
│          (Application-level, on inverse side)
│
└─ NO → Don't use cascade
    └─ Manage relationships explicitly in code
```

---

### Best Practices

#### ✅ Recommended Configuration

```typescript
// Profile (Owning Side)
@OneToOne(() => User, (user) => user.profile, {
  onDelete: 'CASCADE',  // Database handles deletions
})
@JoinColumn()

// User (Inverse Side)
@OneToOne(() => Profile, (profile) => profile.user, {
  cascade: ['insert', 'update'],  // Convenience for creates/updates
})
```

**Why?**
- `onDelete: 'CASCADE'` handles deletions reliably at database level
- `cascade: ['insert', 'update']` provides convenience for creating/updating
- Avoids potential double-delete issues with `cascade: ['remove']`
- Clear separation of concerns

#### ❌ Avoid This

```typescript
// Don't use cascade: ['remove'] with onDelete: 'CASCADE'
@OneToOne(() => Profile, (profile) => profile.user, {
  cascade: ['insert', 'update', 'remove'],  // Can cause issues
})
```

**Why avoid?**
- Redundant with database-level cascade
- Can cause double-delete attempts
- Application-level cascades may fail silently

---

### Loading Relations

#### Method 1: Using `relations` Option

```typescript
// In service
const user = await this.userRepository.findOne({
  where: { id: userId },
  relations: ['profile'],  // Loads profile relation
});

// Result:
{
  id: 'uuid...',
  email: 'test@example.com',
  username: 'testuser',
  profile: {
    id: 'uuid...',
    firstName: 'John',
    lastName: 'Doe',
    // ... other profile fields
  }
}
```

#### Method 2: Using `eager: true`

```typescript
// In entity
@OneToOne(() => Profile, (profile) => profile.user, {
  eager: true,  // Always loads profile automatically
  cascade: ['insert', 'update'],
})
profile: Profile;

// In service - no need to specify relations
const user = await this.userRepository.findOne({
  where: { id: userId },
  // Profile is loaded automatically!
});
```

**⚠️ Warning**: Use `eager: true` carefully:
- Loads relation in EVERY query (performance impact)
- Can cause circular loading issues
- Not recommended for large relations
- Better to explicitly specify `relations` when needed

---

### Generated SQL Queries

#### Creating User with Profile

```typescript
const user = await userRepository.save({
  email: 'test@example.com',
  username: 'testuser',
  password: 'pass123',
  profile: { firstName: 'John', lastName: 'Doe' }
});
```

**Generated SQL:**
```sql
START TRANSACTION

-- Insert User first
INSERT INTO "nestjs_app_user"
  ("email", "username", "password", "createdAt", "updatedAt")
VALUES
  ($1, $2, $3, DEFAULT, DEFAULT)
RETURNING *

-- Insert Profile with userId foreign key
INSERT INTO "nestjs_app_profile"
  ("firstName", "lastName", "userId", "createdAt", "updatedAt")
VALUES
  ($1, $2, $3, DEFAULT, DEFAULT)
RETURNING *

COMMIT
```

---

#### Finding User with Profile

```typescript
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['profile'],
});
```

**Generated SQL (TypeORM's two-step approach):**

**Step 1: Get distinct User IDs**
```sql
SELECT DISTINCT "distinctAlias"."User_id" AS "ids_User_id"
FROM (
  SELECT
    "User"."id" AS "User_id",
    "User"."email" AS "User_email",
    "User"."username" AS "User_username",
    -- ... other user columns

    "User__User_profile"."id" AS "User__User_profile_id",
    "User__User_profile"."firstName" AS "User__User_profile_firstName",
    "User__User_profile"."lastName" AS "User__User_profile_lastName",
    -- ... other profile columns

  FROM "nestjs_app_user" "User"

  LEFT JOIN "nestjs_app_profile" "User__User_profile"
    ON "User__User_profile"."userId" = "User"."id"
    AND ("User__User_profile"."deletedAt" IS NULL)

  WHERE
    "User"."id" = $1
    AND "User"."deletedAt" IS NULL

) "distinctAlias"
ORDER BY "User_id" ASC
LIMIT 1
```

**Step 2: Fetch full data for those IDs**
```sql
SELECT
  "User"."id", "User"."email", "User"."username",
  "User__User_profile"."id", "User__User_profile"."firstName",
  -- ... all columns

FROM "nestjs_app_user" "User"

LEFT JOIN "nestjs_app_profile" "User__User_profile"
  ON "User__User_profile"."userId" = "User"."id"
  AND ("User__User_profile"."deletedAt" IS NULL)

WHERE
  "User"."id" = $1
  AND "User"."deletedAt" IS NULL
  AND "User"."id" IN ($2)
```

**Why two queries?**
- Efficient handling of pagination with relations
- Avoids DISTINCT on all columns (slow)
- First query gets IDs with LIMIT/OFFSET (fast)
- Second query fetches full data for specific IDs

---

#### Deleting User (with CASCADE)

```typescript
await userRepository.delete({ id: userId });
```

**Generated SQL:**
```sql
DELETE FROM "nestjs_app_user"
WHERE "id" = $1

-- PostgreSQL automatically executes (via FK constraint):
-- DELETE FROM "nestjs_app_profile" WHERE "userId" = $1
```

The profile deletion happens automatically because of:
```typescript
@OneToOne(() => User, (user) => user.profile, {
  onDelete: 'CASCADE',  // ← This creates the FK constraint
})
@JoinColumn()
```

---

### Common Issues & Solutions

#### Issue 1: Error - "Cannot read properties of undefined (reading 'joinColumns')"

**Cause:** Missing inverse relation callback in `@OneToOne` decorator.

```typescript
// ❌ Wrong - missing callback
@OneToOne(() => Profile, {
  cascade: ['insert', 'update'],
})

// ✅ Correct - includes callback
@OneToOne(() => Profile, (profile) => profile.user, {
  cascade: ['insert', 'update'],
})
```

---

#### Issue 2: Profile returns null when fetching User

**Cause:** Foreign key is in the wrong table or not populated.

**Solution:**
- Ensure `@JoinColumn()` is on the correct side (Profile)
- If you moved `@JoinColumn()`, existing data needs migration or recreation
- Check that `userId` exists in Profile table and matches User.id

---

#### Issue 3: Profile not deleted when User is deleted

**Cause:** Missing `onDelete: 'CASCADE'` on owning side.

```typescript
// ❌ Wrong - no cascade delete
@OneToOne(() => User, (user) => user.profile)
@JoinColumn()

// ✅ Correct
@OneToOne(() => User, (user) => user.profile, {
  onDelete: 'CASCADE',
})
@JoinColumn()
```

---

### Decision Guide: Where to Put @JoinColumn?

Ask yourself: **Which entity depends on the other?**

| Scenario | Owning Side (has @JoinColumn) | Why |
|----------|-------------------------------|-----|
| User ↔ Profile | Profile | Profile cannot exist without User |
| User ↔ Settings | Settings | Settings are specific to a User |
| Employee ↔ EmployeeDetails | EmployeeDetails | Details depend on Employee |
| Post ↔ PostMetadata | PostMetadata | Metadata depends on Post |

**General Rule:** The dependent/child entity should be the owning side and contain the foreign key.

---

### Complete Working Example

```typescript
// 1. Define entities
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: ['insert', 'update'],
  })
  profile: Profile;
}

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}

// 2. Create with nested profile
const user = await userRepository.save({
  email: 'test@example.com',
  profile: {
    firstName: 'John'
  }
});

// 3. Find with relation
const foundUser = await userRepository.findOne({
  where: { id: user.id },
  relations: ['profile'],
});

// 4. Update profile through user
foundUser.profile.firstName = 'Jane';
await userRepository.save(foundUser);

// 5. Delete user (profile deleted automatically)
await userRepository.delete({ id: user.id });
```

---

## One-to-Many / Many-to-One

**Remember:** When you have a Many-to-One relationship, the foreign key is **always stored in the table on the "many" side**.

### Example: User ↔ Tweets

A User can have many Tweets, but each Tweet belongs to exactly one User. This is the most common type of relationship in databases.

### Database Schema

```
┌─────────────────┐         ┌─────────────────┐
│  User Table     │         │  Tweet Table    │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │←───────┐│ id (PK)         │
│ email           │        ││ title           │
│ username        │        ││ content         │
│ createdAt       │        ││ image           │
│                 │        │├─────────────────┤
│                 │        └│ userId (FK)     │ ← Foreign key on "many" side
│                 │         │ createdAt       │
└─────────────────┘         └─────────────────┘
     ONE                         MANY
```

**Key Points:**
- Tweet table contains the foreign key (`userId`)
- One User can have multiple Tweets
- Each Tweet has exactly one User
- The "many" side (Tweet) is the **owning side**

---

### Understanding the Relationship

#### Terminology

| Term | Description | In Our Example |
|------|-------------|----------------|
| **One-to-Many** | One parent can have many children | User has many Tweets |
| **Many-to-One** | Many children belong to one parent | Tweet belongs to one User |
| **Owning Side** | The side with the foreign key | Tweet (has `userId`) |
| **Inverse Side** | The side without the foreign key | User (no foreign key) |

**Important:** One-to-Many and Many-to-One are the **same relationship** viewed from different perspectives!

```typescript
// View 1: One-to-Many (from User's perspective)
User → has many → Tweets

// View 2: Many-to-One (from Tweet's perspective)
Tweet → belongs to one → User
```

---

### Entity Configuration

#### Many Side (Tweet Entity) - Owning Side

The entity with `@ManyToOne` is the owning side and contains the foreign key.

```typescript
// src/app/tweet/entities/tweet.entity.ts
import { User } from 'src/app/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 300 })
  content: string;

  // Many-to-One: Many tweets belong to one user
  @ManyToOne(() => User, (user) => user.tweets, {
    nullable: false,      // Tweet must have a user
    onDelete: 'CASCADE',  // Delete tweet when user is deleted
  })
  @JoinColumn()  // Optional: Creates userId foreign key column
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Key Configuration:**
- `@ManyToOne()` - Defines the many-to-one relationship
- `@JoinColumn()` - Optional (TypeORM creates FK automatically for @ManyToOne)
- `(user) => user.tweets` - Points to the inverse side property
- `nullable: false` - Tweet cannot exist without a User
- `onDelete: 'CASCADE'` - Database-level cascade delete

---

#### One Side (User Entity) - Inverse Side

The entity with `@OneToMany` is the inverse side (no foreign key).

```typescript
// src/app/users/entities/user.entity.ts
import { Tweet } from 'src/app/tweet/entities/tweet.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  // One-to-Many: One user has many tweets
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update'],  // Application-level cascade
  })
  tweets: Tweet[];  // Array of tweets
}
```

**Key Configuration:**
- `@OneToMany()` - Defines the one-to-many relationship
- NO `@JoinColumn()` - Inverse side doesn't have the foreign key
- `(tweet) => tweet.user` - Points to the owning side property
- `tweets: Tweet[]` - Must be an array
- `cascade: ['insert', 'update']` - Optional application-level cascade

---

### Critical Rules

#### Rule 1: @OneToMany Cannot Exist Without @ManyToOne

```typescript
// ❌ WRONG - @OneToMany alone doesn't work
@Entity()
export class User {
  @OneToMany(() => Tweet)  // Missing the inverse relation!
  tweets: Tweet[];
}

// ✅ CORRECT - Must have @ManyToOne on the other side
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)
  user: User;
}
```

#### Rule 2: @ManyToOne Can Exist Alone (Unidirectional)

```typescript
// ✅ VALID - @ManyToOne without @OneToMany
@Entity()
export class Tweet {
  @ManyToOne(() => User)
  user: User;
}

@Entity()
export class User {
  // No @OneToMany defined
  // You can't access user.tweets, but tweet.user works fine
}
```

**When to use unidirectional:**
- You only need to access the relationship from one side
- You want to avoid circular dependencies
- Performance: smaller queries when you don't load collections

#### Rule 3: Foreign Key is ALWAYS on the @ManyToOne Side

```typescript
// Database will have:
// tweet table:
//   - id (PK)
//   - userId (FK) ← Automatically created here!
//
// user table:
//   - id (PK)
//   - (no foreign key)
```

---

### Cascade Operations for One-to-Many

#### Database-Level Cascade (on @ManyToOne side)

```typescript
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    onDelete: 'CASCADE',   // Delete tweets when user is deleted
    onUpdate: 'CASCADE',   // Update userId when user.id changes
  })
  user: User;
}
```

**Behavior:**
```typescript
// When you delete a user
await userRepository.delete({ id: userId });

// Database automatically executes:
// DELETE FROM tweet WHERE userId = 'user-id'
// All tweets by this user are deleted automatically!
```

**Available Actions:**

| Action | Behavior | Use Case |
|--------|----------|----------|
| `CASCADE` | Delete all tweets when user is deleted | Social media - delete posts with account |
| `SET NULL` | Set `userId` to NULL (requires `nullable: true`) | Blog - keep posts as "anonymous" |
| `RESTRICT` | Prevent user deletion if tweets exist | E-commerce - can't delete user with orders |
| `NO ACTION` | Same as RESTRICT (default) | Default behavior |

**Example: All Actions**

```typescript
// CASCADE - Delete tweets with user
@Entity()
export class Tweet {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}

// SET NULL - Keep tweets, remove user reference
@Entity()
export class Post {
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true  // Must be nullable!
  })
  author: User;
}

// RESTRICT - Prevent deletion if tweets exist
@Entity()
export class Order {
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  customer: User;
}
// Trying to delete user with orders fails:
// ERROR: update or delete on table "user" violates foreign key constraint
```

---

#### Application-Level Cascade (on @OneToMany side)

```typescript
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update'],  // TypeORM handles these
  })
  tweets: Tweet[];
}
```

##### cascade: ['insert'] - Auto-Save New Tweets

```typescript
// Create user with nested tweets
const user = userRepository.create({
  email: 'user@example.com',
  username: 'johndoe',
  tweets: [
    { title: 'First Tweet', content: 'Hello World!' },
    { title: 'Second Tweet', content: 'Learning TypeORM!' },
  ]
});

await userRepository.save(user);
// ✅ User AND all tweets saved automatically!

// Generated SQL:
// START TRANSACTION
// INSERT INTO "user" ("email", "username") VALUES ($1, $2) RETURNING "id"
// INSERT INTO "tweet" ("title", "content", "userId") VALUES ($1, $2, $3)
// INSERT INTO "tweet" ("title", "content", "userId") VALUES ($1, $2, $3)
// COMMIT
```

##### cascade: ['update'] - Auto-Update Tweets

```typescript
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['tweets']  // Must load relation!
});

// Modify tweets
user.tweets[0].title = 'Updated Title';
user.tweets.push({ title: 'New Tweet', content: 'Added later' } as Tweet);

await userRepository.save(user);
// ✅ User AND all tweet changes saved!
```

##### cascade: ['remove'] - Auto-Delete Tweets

```typescript
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['tweets']
});

await userRepository.remove(user);
// ✅ Deletes user AND all their tweets

// ⚠️ WARNING: Tweets must be loaded in memory to cascade!
```

---

### Loading Strategies

#### 1. Explicit Loading (Recommended)

Load relations only when needed.

```typescript
// Load without tweets
const user = await userRepository.findOne({
  where: { id: userId }
});
console.log(user.tweets);  // undefined

// Load with tweets
const userWithTweets = await userRepository.findOne({
  where: { id: userId },
  relations: ['tweets']  // Explicitly load
});
console.log(userWithTweets.tweets);  // Array of tweets
```

**Pros:**
- Full control over what's loaded
- Better performance (load only when needed)
- Explicit and easy to understand

**Cons:**
- Must remember to specify relations

---

#### 2. Eager Loading

Automatically loads relation in every query.

```typescript
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    eager: true  // ← Always load tweets
  })
  tweets: Tweet[];
}

// Now tweets are loaded automatically
const user = await userRepository.findOne({
  where: { id: userId }
  // No need to specify relations!
});
console.log(user.tweets);  // ✅ Array of tweets (loaded automatically)
```

**⚠️ Important Constraints:**

1. **Only ONE side can be eager:**
```typescript
// ❌ WRONG - Both sides eager
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    eager: true  // ❌
  })
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    eager: true  // ❌ Conflict!
  })
  user: User;
}

// ✅ CORRECT - Only one side eager
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    eager: true  // ✅ OK on one side
  })
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)
  // No eager here
  user: User;
}
```

2. **Doesn't work with QueryBuilder:**
```typescript
// Eager loading is DISABLED in QueryBuilder
const users = await userRepository
  .createQueryBuilder('user')
  .where('user.email = :email', { email: 'test@example.com' })
  .getMany();

console.log(users[0].tweets);  // undefined (eager ignored!)

// Must use leftJoinAndSelect
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.tweets', 'tweet')
  .where('user.email = :email', { email: 'test@example.com' })
  .getMany();

console.log(users[0].tweets);  // ✅ Array of tweets
```

**Pros:**
- Convenient (no need to specify relations)
- Less code

**Cons:**
- **Performance issue:** ALWAYS loads all tweets in every query
- Can load unnecessary data
- Doesn't work with QueryBuilder
- Can cause performance problems with large collections

**When to use eager:**
- Small, frequently accessed collections
- Relations almost always needed
- Prototyping/development

**When to avoid eager:**
- Large collections (hundreds/thousands of items)
- Relations rarely needed
- Using QueryBuilder extensively
- Production with performance concerns

---

#### 3. Lazy Loading (Not Recommended)

⚠️ **TypeORM supports lazy loading but it's generally not recommended.**

```typescript
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Promise<Tweet[]>;  // Note: Promise type
}

// Usage
const user = await userRepository.findOne({ where: { id: userId } });
const tweets = await user.tweets;  // Must await the promise
```

**Why avoid lazy loading:**

**N+1 Problem:**
```typescript
const users = await userRepository.find();  // 1 query

for (const user of users) {
  const tweets = await user.tweets;  // N queries (1 per user)!
  console.log(tweets.length);
}
// Total: 1 + N queries (VERY SLOW for many users!)
```

**Better approach:**
```typescript
const users = await userRepository.find({
  relations: ['tweets']  // Single query with JOIN
});

for (const user of users) {
  console.log(user.tweets.length);  // No additional queries
}
// Total: 1 query (MUCH FASTER!)
```

---

### 🎯 Comprehensive Guide: Loading Relations & Joins

This section answers the critical questions: **When, Why, and Where** to explicitly load relations.

---

#### 📌 The Fundamental Rule

**By default, TypeORM does NOT load relations automatically.**

```typescript
// ❌ Relations NOT loaded by default
const user = await userRepository.findOne({
  where: { id: userId }
});
console.log(user.tweets);  // undefined ❌
console.log(user.profile);  // undefined ❌

// ✅ Must explicitly specify
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['tweets', 'profile']  // ← Explicitly load
});
console.log(user.tweets);   // Array of tweets ✅
console.log(user.profile);  // Profile object ✅
```

**Why this design?**
- **Performance**: Avoids loading unnecessary data
- **Explicit**: You control what gets loaded
- **Prevents N+1**: Forces you to think about queries

---

#### 🔍 WHEN to Explicitly Load Relations

| Scenario | Need to Load Relations? | Why |
|----------|------------------------|-----|
| **Displaying user profile WITH tweets** | ✅ YES | You need to show tweet data |
| **Displaying user profile WITHOUT tweets** | ❌ NO | No need for extra data |
| **Updating user's tweet** | ✅ YES | Need to access tweet.user for validation |
| **Listing all tweets** | ✅ YES (user relation) | Need to display author info |
| **Counting tweets** | ❌ NO | Use aggregation query instead |
| **Cascade saves (insert/update)** | ⚠️ MAYBE | Only if using `cascade` options |
| **Cascade deletes (remove)** | ✅ YES | Required for app-level cascade |
| **API endpoint returning tweet+user** | ✅ YES | Response includes nested data |
| **Background job processing** | ⚠️ DEPENDS | Load only if needed |

---

#### ❓ WHY You Need to Explicitly Load

**Reason 1: Avoid Undefined Errors**

```typescript
// ❌ WRONG - Will crash!
const tweet = await tweetRepository.findOne({
  where: { id: tweetId }
  // Missing: relations: ['user']
});

return {
  id: tweet.id,
  title: tweet.title,
  authorName: tweet.user.username  // ❌ Error: Cannot read 'username' of undefined!
};

// ✅ CORRECT
const tweet = await tweetRepository.findOne({
  where: { id: tweetId },
  relations: ['user']  // ← Load user relation
});

return {
  id: tweet.id,
  title: tweet.title,
  authorName: tweet.user.username  // ✅ Works!
};
```

**Reason 2: Cascade Operations Require Loaded Relations**

```typescript
// Example: cascade: ['remove']
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['remove']  // Will remove tweets when user removed
  })
  tweets: Tweet[];
}

// ❌ WRONG - Cascade won't work!
const user = await userRepository.findOne({
  where: { id: userId }
  // Missing: relations: ['tweets']
});
await userRepository.remove(user);
// Only user deleted, tweets remain! ❌

// ✅ CORRECT - Cascade works
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['tweets']  // ← Must load for cascade
});
await userRepository.remove(user);
// User AND tweets deleted! ✅
```

**Reason 3: Data Integrity & Validation**

```typescript
// Example: Ensure user can only update their own tweets
async updateTweet(userId: string, tweetId: string, data: UpdateTweetDto) {
  // ❌ WRONG - Can't check ownership
  const tweet = await this.tweetRepository.findOne({
    where: { id: tweetId }
  });

  // tweet.user is undefined, can't validate!
  // if (tweet.user.id !== userId) { ... } // ❌ Error!

  // ✅ CORRECT - Load user to validate
  const tweet = await this.tweetRepository.findOne({
    where: { id: tweetId },
    relations: ['user']  // ← Load to validate ownership
  });

  if (tweet.user.id !== userId) {
    throw new ForbiddenException('Not your tweet!');
  }

  // Proceed with update...
}
```

**Reason 4: Performance Optimization (Single Query vs N+1)**

```typescript
// ❌ BAD - N+1 queries
const tweets = await tweetRepository.find();  // 1 query

for (const tweet of tweets) {
  const user = await userRepository.findOne({
    where: { id: tweet.userId }
  });  // N queries (one per tweet!)
  console.log(user.username);
}
// Total: 1 + N queries 💥

// ✅ GOOD - Single query with JOIN
const tweets = await tweetRepository.find({
  relations: ['user']  // 1 query with JOIN
});

for (const tweet of tweets) {
  console.log(tweet.user.username);  // Already loaded!
}
// Total: 1 query ⚡
```

---

#### 📍 WHERE to Add Relations

**Method 1: Using `relations` Option (Recommended for Simple Queries)**

```typescript
// In Service
async findAll() {
  return this.tweetRepository.find({
    relations: ['user'],  // ← Load user relation
    order: { createdAt: 'DESC' }
  });
}

async findOne(id: string) {
  return this.tweetRepository.findOne({
    where: { id },
    relations: ['user', 'user.profile']  // ← Nested relations
  });
}

async findByUserId(userId: string) {
  return this.tweetRepository.find({
    where: { user: { id: userId } },
    relations: ['user']  // ← Still specify even when filtering by it
  });
}
```

**When to use `relations`:**
- ✅ Simple find/findOne queries
- ✅ Straightforward filtering
- ✅ When you need ALL relation data
- ✅ Prototyping/simple apps

**Method 2: Using QueryBuilder (Recommended for Complex Queries)**

```typescript
// In Service
async findWithComplexFilters(filters: TweetFilterDto) {
  const query = this.tweetRepository
    .createQueryBuilder('tweet')
    .leftJoinAndSelect('tweet.user', 'user')  // ← Load user relation
    .leftJoinAndSelect('user.profile', 'profile');  // ← Nested relations

  if (filters.userId) {
    query.andWhere('tweet.userId = :userId', { userId: filters.userId });
  }

  if (filters.keyword) {
    query.andWhere('tweet.title ILIKE :keyword', {
      keyword: `%${filters.keyword}%`
    });
  }

  return query
    .orderBy('tweet.createdAt', 'DESC')
    .take(20)
    .getMany();
}

async getTweetWithUserStats(tweetId: string) {
  return this.tweetRepository
    .createQueryBuilder('tweet')
    .leftJoinAndSelect('tweet.user', 'user')
    .loadRelationCountAndMap('user.tweetCount', 'user.tweets')  // ← Count relation
    .where('tweet.id = :id', { id: tweetId })
    .getOne();
}
```

**When to use QueryBuilder:**
- ✅ Complex filtering with AND/OR conditions
- ✅ Conditional joins
- ✅ Partial selection of columns
- ✅ Aggregations (COUNT, SUM, AVG)
- ✅ Subqueries
- ✅ Performance-critical queries
- ✅ When you need specific columns, not all data

**Method 3: Entity-Level Eager Loading (Use Sparingly)**

```typescript
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    eager: true  // ← Always loads user automatically
  })
  user: User;
}

// Now user is loaded automatically
const tweet = await tweetRepository.findOne({
  where: { id: tweetId }
  // No need to specify relations: ['user']
});
console.log(tweet.user);  // ✅ Loaded automatically
```

**When to use `eager: true`:**
- ✅ Small, always-needed relations (e.g., tweet.user)
- ✅ Relations used in 90%+ of queries
- ⚠️ **Never on collections** (OneToMany) with many items
- ⚠️ **Only on one side** of relationship (not both)

**⚠️ IMPORTANT: Eager Loading Limitations**
```typescript
// ❌ Eager loading DISABLED in QueryBuilder!
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .where('tweet.title LIKE :keyword', { keyword: '%nestjs%' })
  .getMany();

console.log(tweets[0].user);  // undefined! Eager ignored in QueryBuilder

// ✅ Must use leftJoinAndSelect
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .leftJoinAndSelect('tweet.user', 'user')  // ← Explicitly join
  .where('tweet.title LIKE :keyword', { keyword: '%nestjs%' })
  .getMany();

console.log(tweets[0].user);  // ✅ Loaded
```

---

#### 🎨 Nested Relations

```typescript
// User → Profile → ProfileSettings (3 levels deep)

// ✅ Method 1: Dot notation with relations
const user = await userRepository.findOne({
  where: { id: userId },
  relations: [
    'profile',                    // Load profile
    'profile.settings',           // Load profile's settings
    'tweets',                     // Load tweets
    'tweets.comments'             // Load tweet comments
  ]
});

// ✅ Method 2: QueryBuilder (more control)
const user = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.profile', 'profile')
  .leftJoinAndSelect('profile.settings', 'settings')
  .leftJoinAndSelect('user.tweets', 'tweets')
  .leftJoinAndSelect('tweets.comments', 'comments')
  .where('user.id = :id', { id: userId })
  .getOne();
```

---

#### ⚡ Performance Considerations

**1. Only Load What You Need**

```typescript
// ❌ BAD - Loading everything unnecessarily
async getAllTweets() {
  return this.tweetRepository.find({
    relations: ['user', 'user.profile', 'user.tweets', 'user.orders']
    // Loading user.tweets when getting tweets makes no sense!
    // Loading user.orders is unnecessary
  });
}

// ✅ GOOD - Load only needed relations
async getAllTweets() {
  return this.tweetRepository.find({
    relations: ['user']  // Only what's needed for display
  });
}
```

**2. Use Pagination for Large Collections**

```typescript
// ❌ BAD - Loading thousands of tweets at once
async getUserWithAllTweets(userId: string) {
  return this.userRepository.findOne({
    where: { id: userId },
    relations: ['tweets']  // Could load 10,000 tweets!
  });
}

// ✅ GOOD - Paginate large collections
async getUserTweetsPaginated(userId: string, page: number = 1) {
  const [tweets, total] = await this.tweetRepository.findAndCount({
    where: { user: { id: userId } },
    relations: ['user'],
    order: { createdAt: 'DESC' },
    skip: (page - 1) * 20,
    take: 20
  });

  return {
    tweets,
    total,
    page,
    totalPages: Math.ceil(total / 20)
  };
}
```

**3. Select Specific Columns with QueryBuilder**

```typescript
// ❌ BAD - Loading all columns
const tweets = await tweetRepository.find({
  relations: ['user']  // Loads ALL user columns
});

// ✅ GOOD - Select only needed columns
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .leftJoinAndSelect('tweet.user', 'user')
  .select([
    'tweet.id',
    'tweet.title',
    'tweet.content',
    'user.id',
    'user.username'  // Only username, not email, password, etc.
  ])
  .getMany();
```

---

#### 🚨 Common Mistakes & Solutions

**Mistake 1: Forgetting to Load Relations**

```typescript
// ❌ ERROR: undefined is not an object
const tweet = await tweetRepository.findOne({ where: { id } });
return { authorName: tweet.user.username };  // ❌ Crash!

// ✅ FIX: Load the relation
const tweet = await tweetRepository.findOne({
  where: { id },
  relations: ['user']
});
return { authorName: tweet.user.username };  // ✅ Works
```

**Mistake 2: Loading Relations in Loops (N+1)**

```typescript
// ❌ N+1 queries
const tweets = await tweetRepository.find();
for (const tweet of tweets) {
  const user = await userRepository.findOne({
    where: { id: tweet.userId }
  });  // Each iteration = 1 query!
}

// ✅ Single query with JOIN
const tweets = await tweetRepository.find({
  relations: ['user']
});
```

**Mistake 3: Circular Eager Loading**

```typescript
// ❌ INFINITE LOOP!
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    eager: true  // Loads tweets
  })
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    eager: true  // Loads user → loads tweets → loads user → infinite!
  })
  user: User;
}

// ✅ FIX: Eager on one side only (or neither)
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];  // No eager
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    eager: true  // OK - only one side
  })
  user: User;
}
```

**Mistake 4: Mixing Relations and QueryBuilder**

```typescript
// ❌ BAD - relations ignored in QueryBuilder!
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .where('tweet.title LIKE :keyword', { keyword: '%nest%' })
  .getMany();
// tweet.user is undefined even if eager: true!

// ✅ GOOD - Use leftJoinAndSelect
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .leftJoinAndSelect('tweet.user', 'user')
  .where('tweet.title LIKE :keyword', { keyword: '%nest%' })
  .getMany();
```

---

#### 📊 Quick Decision Matrix

| Your Situation | Recommended Approach | Example |
|---------------|---------------------|---------|
| **Simple find with 1-2 relations** | Use `relations: []` | `find({ relations: ['user'] })` |
| **Complex filtering/conditions** | Use QueryBuilder | `createQueryBuilder().leftJoinAndSelect()` |
| **Always need relation (90%+ time)** | Consider `eager: true` | `@ManyToOne(() => User, { eager: true })` |
| **Large collection (100+ items)** | Paginate + explicit load | `findAndCount({ skip, take, relations })` |
| **Need specific columns only** | QueryBuilder with select | `.select(['tweet.id', 'user.username'])` |
| **Cascade operations** | Load relations explicitly | `findOne({ where, relations })` before remove |
| **Counting/aggregation** | QueryBuilder without join | `count()` or `getCount()` |
| **API response needs nested data** | Load all needed relations | `relations: ['user', 'user.profile']` |
| **Background job/processing** | Load only if accessing property | Conditional based on logic |

---

#### ✅ Best Practices Summary

**DO:**
- ✅ Load relations explicitly when you need to access related data
- ✅ Use `relations: []` for simple queries
- ✅ Use QueryBuilder for complex filtering
- ✅ Load relations for cascade operations
- ✅ Use pagination for large collections
- ✅ Consider `eager: true` only for frequently-used small relations
- ✅ Load relations when validating data (e.g., ownership checks)

**DON'T:**
- ❌ Assume relations are loaded automatically
- ❌ Use `eager: true` on both sides of a relationship
- ❌ Load all relations "just in case"
- ❌ Forget relations in loops (causes N+1)
- ❌ Use lazy loading (`Promise<T[]>`)
- ❌ Load large collections without pagination
- ❌ Mix `relations: []` with QueryBuilder (won't work)

---

### Foreign Key Indexing & Performance

#### PostgreSQL Foreign Key Behavior

**Important:** PostgreSQL does **NOT** automatically create indexes on foreign key columns!

```sql
-- When you define a @ManyToOne relationship:
CREATE TABLE "tweet" (
  "id" uuid PRIMARY KEY,
  "userId" uuid NOT NULL,
  CONSTRAINT "FK_tweet_user" FOREIGN KEY ("userId")
    REFERENCES "user"("id") ON DELETE CASCADE
);

-- Index on "userId" is NOT created automatically!
```

#### Why Index Foreign Keys?

**1. JOIN Performance**

```typescript
// Without index on tweet.userId
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.tweets', 'tweet')
  .getMany();

// PostgreSQL must do a FULL TABLE SCAN on tweet table!
// Performance: O(n) - scans ALL tweets
```

```typescript
// With index on tweet.userId
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.tweets', 'tweet')
  .getMany();

// PostgreSQL uses INDEX on userId for efficient lookup
// Performance: O(log n) - uses B-tree index
```

**2. DELETE/UPDATE Performance**

```typescript
await userRepository.delete({ id: userId });
```

```sql
-- PostgreSQL must check all tweets to enforce CASCADE
-- Without index: Full table scan
-- With index: Fast lookup via index
```

**3. Finding Related Records**

```typescript
// Find all tweets by a user
const tweets = await tweetRepository.find({
  where: { user: { id: userId } }
});

// Without index on userId: Scans ALL tweets
// With index: Direct lookup via index
```

---

#### How to Add Indexes

##### Method 1: Using @Index() Decorator (Recommended)

```typescript
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  @Index()  // ← Explicitly create index on userId
  user: User;
}
```

##### Method 2: Index on Column Level

```typescript
@Entity()
export class Tweet {
  @Column()
  @Index()  // ← Create index
  userId: string;

  @ManyToOne(() => User, (user) => user.tweets)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

##### Method 3: Entity-Level Index

```typescript
@Entity()
@Index(['userId'])  // ← Create index on userId
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

**Generated SQL:**
```sql
CREATE INDEX "IDX_tweet_userId" ON "tweet"("userId");
```

---

#### When to Index Foreign Keys

**✅ Index When:**
- Frequently joining tables
- Large number of child records
- Regular queries filtering by foreign key
- CASCADE deletes/updates on parent

**❌ Don't Index When:**
- Very few child records (< 100)
- FK column rarely queried
- High write volume, low read volume
- Trying to optimize prematurely

**Performance Trade-off:**
```
Indexes:
  + Faster SELECT/JOIN/DELETE queries
  - Slower INSERT/UPDATE operations
  - More disk space

Rule of thumb: Index foreign keys on "many" side if table has > 1000 rows
```

---

### Generated SQL Queries

#### Creating User with Tweets

```typescript
const user = await userRepository.save({
  email: 'john@example.com',
  username: 'johndoe',
  tweets: [
    { title: 'First', content: 'Hello!' },
    { title: 'Second', content: 'World!' }
  ]
});
```

**Generated SQL:**
```sql
START TRANSACTION

-- 1. Insert User first
INSERT INTO "nestjs_app_user" ("email", "username", "createdAt")
VALUES ($1, $2, DEFAULT)
RETURNING "id", "email", "username", "createdAt"
-- Parameters: ["john@example.com", "johndoe"]

-- 2. Insert Tweets with userId foreign key
INSERT INTO "nestjs_app_tweet" ("title", "content", "userId", "createdAt")
VALUES ($1, $2, $3, DEFAULT)
RETURNING "id", "title", "content", "userId", "createdAt"
-- Parameters: ["First", "Hello!", "user-uuid-here"]

INSERT INTO "nestjs_app_tweet" ("title", "content", "userId", "createdAt")
VALUES ($1, $2, $3, DEFAULT)
RETURNING "id", "title", "content", "userId", "createdAt"
-- Parameters: ["Second", "World!", "user-uuid-here"]

COMMIT
```

---

#### Finding User with Tweets

```typescript
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['tweets']
});
```

**Generated SQL:**
```sql
-- TypeORM uses LEFT JOIN to load tweets
SELECT
  "user"."id" AS "user_id",
  "user"."email" AS "user_email",
  "user"."username" AS "user_username",
  "user_tweets"."id" AS "user_tweets_id",
  "user_tweets"."title" AS "user_tweets_title",
  "user_tweets"."content" AS "user_tweets_content",
  "user_tweets"."userId" AS "user_tweets_userId"
FROM "nestjs_app_user" "user"
LEFT JOIN "nestjs_app_tweet" "user_tweets"
  ON "user_tweets"."userId" = "user"."id"
  AND "user_tweets"."deletedAt" IS NULL
WHERE "user"."id" = $1
  AND "user"."deletedAt" IS NULL
-- Parameters: ["user-uuid"]
```

**Result Transformation:**
```typescript
// TypeORM transforms the flat result into nested objects:
{
  id: 'user-uuid',
  email: 'john@example.com',
  username: 'johndoe',
  tweets: [
    { id: 'tweet-1', title: 'First', content: 'Hello!' },
    { id: 'tweet-2', title: 'Second', content: 'World!' }
  ]
}
```

---

#### Deleting User (Cascades to Tweets)

```typescript
await userRepository.delete({ id: userId });
```

**Generated SQL:**
```sql
-- Step 1: Delete user
DELETE FROM "nestjs_app_user"
WHERE "id" = $1

-- Step 2: Database automatically cascades (via FK constraint)
-- DELETE FROM "nestjs_app_tweet" WHERE "userId" = $1
-- (executed automatically by PostgreSQL)
```

The cascade happens at the database level because of:
```typescript
@ManyToOne(() => User, (user) => user.tweets, {
  onDelete: 'CASCADE'  // ← Creates FK constraint with ON DELETE CASCADE
})
```

---

### Best Practices

#### ✅ Recommended Patterns

**1. Define Both Sides for Bi-directional Access**

```typescript
// Good: Can access from both directions
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)
  user: User;
}

// Usage:
user.tweets       // ✅ Works
tweet.user        // ✅ Works
```

**2. Use Database CASCADE for Deletes**

```typescript
// Good: Reliable, performant
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    onDelete: 'CASCADE'  // Database handles it
  })
  user: User;
}
```

**3. Use Application CASCADE for Creates/Updates**

```typescript
// Good: Convenient for nested saves
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update']  // App-level convenience
  })
  tweets: Tweet[];
}
```

**4. Index Foreign Keys on Large Tables**

```typescript
@Entity()
@Index(['userId'])  // ← Add index for performance
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

**5. Use Explicit Loading by Default**

```typescript
// Good: Load only when needed
const user = await userRepository.findOne({
  where: { id },
  relations: ['tweets']  // Explicit
});
```

---

#### ❌ Anti-Patterns to Avoid

**1. Don't Use Eager Loading on Large Collections**

```typescript
// ❌ Bad: Loads ALL tweets in EVERY query
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    eager: true  // Loads 10,000 tweets every time!
  })
  tweets: Tweet[];
}

// ✅ Good: Load explicitly when needed
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];
}
```

**2. Don't Use Both CASCADE Delete Methods**

```typescript
// ❌ Bad: Redundant and can cause conflicts
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    onDelete: 'CASCADE'  // Database-level
  })
  user: User;
}

@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['remove']  // Application-level - conflicts!
  })
  tweets: Tweet[];
}

// ✅ Good: Use only database cascade for deletes
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    onDelete: 'CASCADE'
  })
  user: User;
}

@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update']  // Only these
  })
  tweets: Tweet[];
}
```

**3. Don't Forget to Load Relations for Application Cascade**

```typescript
// ❌ Bad: Cascade won't work
const user = await userRepository.findOne({
  where: { id }
  // Missing: relations: ['tweets']
});
await userRepository.remove(user);  // Only deletes user!

// ✅ Good: Load relations first
const user = await userRepository.findOne({
  where: { id },
  relations: ['tweets']
});
await userRepository.remove(user);  // Deletes user and tweets
```

**4. Don't Use Lazy Loading (N+1 Problem)**

```typescript
// ❌ Bad: N+1 queries
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Promise<Tweet[]>;  // Lazy loading
}

const users = await userRepository.find();  // 1 query
for (const user of users) {
  const tweets = await user.tweets;  // N queries!
}

// ✅ Good: Single query with JOIN
const users = await userRepository.find({
  relations: ['tweets']
});
for (const user of users) {
  console.log(user.tweets);  // Already loaded
}
```

**5. Don't Use CASCADE on Optional Relations**

```typescript
// ❌ Bad: Deletes valuable data
@Entity()
export class Order {
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',  // Deletes orders when user deleted!
    nullable: true
  })
  customer: User;
}

// ✅ Good: Keep historical data
@Entity()
export class Order {
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',  // Keep order, remove user reference
    nullable: true
  })
  customer: User;
}
```

---

#### 📋 Best Practices Summary

| Category | ✅ DO | ❌ DON'T |
|----------|-------|----------|
| **Relationship Direction** | Use bidirectional for full access (`@OneToMany` + `@ManyToOne`) | Define only `@OneToMany` without `@ManyToOne` (will fail) |
| **Cascade Deletes** | Use `onDelete: 'CASCADE'` on `@ManyToOne` side | Mix `onDelete: 'CASCADE'` with `cascade: ['remove']` |
| **Cascade Saves** | Use `cascade: ['insert', 'update']` on `@OneToMany` side | Use `cascade: ['remove']` when you have database cascade |
| **Indexing** | Add `@Index(['userId'])` on foreign keys for large tables | Forget to index foreign keys in production |
| **Loading Relations** | Load explicitly with `relations: ['tweets']` when needed | Use `eager: true` on large collections |
| **Lazy Loading** | Use explicit loading or eager (carefully) | Use lazy loading (`Promise<Tweet[]>`) - causes N+1 |
| **Optional Relations** | Use `onDelete: 'SET NULL'` with `nullable: true` | Use `onDelete: 'CASCADE'` on historical/valuable data |
| **Required Relations** | Use `nullable: false` to enforce business rules | Allow `nullable: true` when relationship is mandatory |
| **Foreign Key Naming** | Use explicit `@JoinColumn({ name: 'userId' })` | Rely on TypeORM auto-naming without documentation |
| **DTOs** | Use foreign key IDs (`userId: string`) in DTOs | Use full entity objects in DTOs |
| **Validation** | Validate foreign entity exists before saving | Assume foreign keys are valid without checking |

#### 🎯 Quick Decision Guide

**When to use which cascade option:**

| Scenario | Recommended Approach |
|----------|---------------------|
| Delete user → delete all tweets | `onDelete: 'CASCADE'` on `@ManyToOne` |
| Delete user → keep tweets (orphaned) | `onDelete: 'SET NULL'` + `nullable: true` |
| Delete user → prevent if has tweets | `onDelete: 'RESTRICT'` or `'NO ACTION'` |
| Save user with nested tweets | `cascade: ['insert', 'update']` on `@OneToMany` |
| Update user → update related tweets | `cascade: ['update']` on `@OneToMany` |
| Full control, no magic | Don't use cascade options, manage manually |

**When to use bidirectional vs unidirectional:**

```typescript
// ✅ Use Bidirectional when:
// - You need to access both user.tweets AND tweet.user
// - You want to save nested objects
// - You need cascade operations

// ✅ Use Unidirectional when:
// - You only access from one direction (e.g., only tweet.user)
// - You want to keep entities loosely coupled
// - The inverse side doesn't need to know about the relationship
```

---

### Common Issues & Solutions

#### Issue 1: "Cannot use @OneToMany without @ManyToOne"

**Error:**
```
EntityMetadataBuilder error: @OneToMany decorator requires @ManyToOne on the related entity
```

**Cause:**
```typescript
// ❌ Missing @ManyToOne
@Entity()
export class User {
  @OneToMany(() => Tweet)  // No inverse relation specified
  tweets: Tweet[];
}
```

**Solution:**
```typescript
// ✅ Add @ManyToOne on Tweet entity
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)
  user: User;
}
```

---

#### Issue 2: Relation Returns Empty Array

**Problem:**
```typescript
const user = await userRepository.findOne({ where: { id } });
console.log(user.tweets);  // undefined (not empty array!)
```

**Solution 1: Load Relations Explicitly**
```typescript
const user = await userRepository.findOne({
  where: { id },
  relations: ['tweets']  // ← Add this
});
console.log(user.tweets);  // ✅ Array of tweets
```

**Solution 2: Use QueryBuilder**
```typescript
const user = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.tweets', 'tweet')
  .where('user.id = :id', { id })
  .getOne();
```

---

#### Issue 3: Cascade Not Working

**Problem:**
```typescript
const user = await userRepository.findOne({ where: { id } });
await userRepository.remove(user);
// Tweets not deleted!
```

**Causes & Solutions:**

**Cause 1: Relations Not Loaded**
```typescript
// ❌ Relations not in memory
const user = await userRepository.findOne({ where: { id } });

// ✅ Load relations
const user = await userRepository.findOne({
  where: { id },
  relations: ['tweets']
});
```

**Cause 2: Using .delete() instead of .remove()**
```typescript
// ❌ .delete() bypasses application cascade
await userRepository.delete({ id });

// ✅ .remove() triggers application cascade
const user = await userRepository.findOne({
  where: { id },
  relations: ['tweets']
});
await userRepository.remove(user);

// OR use database cascade (better)
@ManyToOne(() => User, { onDelete: 'CASCADE' })
```

---

#### Issue 4: Performance Problems with Large Collections

**Problem:**
```typescript
// Loads 10,000 tweets every time!
const user = await userRepository.findOne({
  where: { id },
  relations: ['tweets']
});
```

**Solutions:**

**Solution 1: Pagination**
```typescript
const tweets = await tweetRepository.find({
  where: { user: { id: userId } },
  take: 20,  // Limit
  skip: 0,   // Offset
  order: { createdAt: 'DESC' }
});
```

**Solution 2: Query Only What You Need**
```typescript
const tweetCount = await tweetRepository.count({
  where: { user: { id: userId } }
});

// Don't load all tweets just to count them!
```

**Solution 3: Use QueryBuilder with Select**
```typescript
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .select(['tweet.id', 'tweet.title'])  // Only these fields
  .where('tweet.userId = :userId', { userId })
  .limit(20)
  .getMany();
```

---

### Complete Working Example

```typescript
// 1. Define Entities
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update']
  })
  tweets: Tweet[];
}

@Entity()
@Index(['userId'])  // Index for performance
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.tweets, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}

// 2. Create User with Tweets
const user = await userRepository.save({
  email: 'john@example.com',
  tweets: [
    { title: 'Hello', content: 'My first tweet!' },
    { title: 'Update', content: 'Learning TypeORM' }
  ]
});

// 3. Find User with Tweets
const userWithTweets = await userRepository.findOne({
  where: { id: user.id },
  relations: ['tweets']
});

console.log(userWithTweets.tweets.length);  // 2

// 4. Add More Tweets
userWithTweets.tweets.push(
  tweetRepository.create({
    title: 'Another',
    content: 'Adding more tweets'
  })
);
await userRepository.save(userWithTweets);

// 5. Find Tweets by User
const tweets = await tweetRepository.find({
  where: { user: { id: user.id } },
  order: { createdAt: 'DESC' }
});

// 6. Delete User (cascades to tweets)
await userRepository.delete({ id: user.id });
// All tweets automatically deleted!
```

---

### Decision Guide

```
Question: Should you use @OneToMany or just @ManyToOne?

├─ Need to access collection from parent?
│  ├─ YES → Use both @OneToMany and @ManyToOne (bi-directional)
│  └─ NO → Use only @ManyToOne (uni-directional)
│
├─ Collection size?
│  ├─ Small (< 100 items) → Safe to load eagerly if needed
│  ├─ Medium (100-1000) → Load explicitly with pagination
│  └─ Large (> 1000) → Always paginate, avoid loading all
│
├─ Foreign key indexing?
│  ├─ Large table (> 1000 rows) → Add index
│  ├─ Frequent JOINs → Add index
│  └─ Small table, rare queries → Skip index
│
└─ Cascade delete behavior?
   ├─ Delete children with parent → onDelete: 'CASCADE'
   ├─ Keep children as orphans → onDelete: 'SET NULL' + nullable: true
   └─ Prevent deletion if children exist → onDelete: 'RESTRICT'
```

---

### Real-World NestJS Implementation

This section shows a complete, production-ready implementation of One-to-Many relationship using the User ↔ Tweet example.

---

#### Complete File Structure

```
src/app/
├── users/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.service.ts
│   └── users.module.ts
├── tweet/
│   ├── entities/
│   │   └── tweet.entity.ts
│   ├── dto/
│   │   ├── create-tweet.dto.ts
│   │   └── update-tweet.dto.ts
│   ├── tweet.controller.ts
│   ├── tweet.service.ts
│   └── tweet.module.ts
```

---

#### 1. Entity Definitions

##### ✅ CORRECT Implementation

```typescript
// src/app/users/entities/user.entity.ts
import { Tweet } from 'src/app/tweet/entities/tweet.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ✅ CORRECT: With cascade for convenience
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update']  // Enable nested saves
  })
  tweets: Tweet[];
}
```

```typescript
// src/app/tweet/entities/tweet.entity.ts
import { User } from 'src/app/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['user'])  // ✅ Index for JOIN performance
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 300 })
  content: string;

  @Column({ type: 'varchar', length: 200 })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ✅ CORRECT: Required relation with database cascade
  @ManyToOne(() => User, (user) => user.tweets, {
    nullable: false,       // Tweet must have a user
    onDelete: 'CASCADE',   // Database-level cascade
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

##### ❌ WRONG Implementation

```typescript
// ❌ BAD: Missing cascade option
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)  // No cascade!
  tweets: Tweet[];
  // Won't be able to create tweets with user
}

// ❌ BAD: No index on foreign key
@Entity()  // Missing @Index(['user'])
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()  // Missing explicit column name
  user: User;
}

// ❌ BAD: Using both cascade methods
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    onDelete: 'CASCADE'  // Database cascade
  })
  user: User;
}
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['remove']  // ❌ Conflicts with database cascade!
  })
  tweets: Tweet[];
}

// ❌ BAD: Nullable when it should be required
@Entity()
export class Tweet {
  @ManyToOne(() => User, {
    nullable: true  // ❌ Tweet without user doesn't make sense
  })
  user: User;
}
```

---

#### 2. DTO Definitions

##### ✅ CORRECT Implementation

```typescript
// src/app/tweet/dto/create-tweet.dto.ts
import { IsNotEmpty, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTweetDto {
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(300)
  content: string;

  @IsNotEmpty()
  image: string;

  // ✅ CORRECT: Use foreign key ID, not full entity
  @IsNotEmpty()
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;
}
```

```typescript
// src/app/tweet/dto/update-tweet.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTweetDto } from './create-tweet.dto';

// ✅ CORRECT: Exclude userId from updates
export class UpdateTweetDto extends PartialType(
  OmitType(CreateTweetDto, ['userId'] as const)
) {}
```

##### ❌ WRONG Implementation

```typescript
// ❌ BAD: Using full entity instead of ID
import { User } from '../users/entities/user.entity';

export class CreateTweetDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  // ❌ BAD: Should be userId: string
  user: User;
}

// ❌ BAD: Missing UUID validation
export class CreateTweetDto {
  @IsNotEmpty()
  userId: string;  // ❌ Should validate UUID format
}

// ❌ BAD: Allowing userId to be changed
export class UpdateTweetDto extends PartialType(CreateTweetDto) {
  // ❌ Includes userId - user can change tweet ownership!
}
```

---

#### 3. Service Implementation

##### ✅ CORRECT Implementation

```typescript
// src/app/tweet/tweet.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ✅ CORRECT: Validate user exists before creating
  async create(createTweetDto: CreateTweetDto) {
    // 1. Find the user
    const user = await this.userRepository.findOneBy({
      id: createTweetDto.userId,
    });

    // 2. Validate user exists
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createTweetDto.userId} not found`
      );
    }

    // 3. Create tweet
    const tweet = this.tweetRepository.create({
      ...createTweetDto,
      user,
    });

    // 4. Save and return
    return this.tweetRepository.save(tweet);
  }

  // ✅ CORRECT: Load relations explicitly
  async findAll() {
    return this.tweetRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ CORRECT: Separate method for filtering by user
  async findByUser(userId: string) {
    // Validate user exists
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.tweetRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ CORRECT: Load relation for single tweet
  async findOne(id: string) {
    const tweet = await this.tweetRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!tweet) {
      throw new NotFoundException(`Tweet with ID ${id} not found`);
    }

    return tweet;
  }

  // ✅ CORRECT: Update without changing user
  async update(id: string, updateTweetDto: UpdateTweetDto) {
    // Check if tweet exists
    await this.findOne(id);

    // Update (userId not included in DTO)
    await this.tweetRepository.update({ id }, updateTweetDto);

    // Return updated tweet
    return this.findOne(id);
  }

  // ✅ CORRECT: Simple delete (cascade handled by database)
  async remove(id: string) {
    const tweet = await this.findOne(id);
    return this.tweetRepository.remove(tweet);
  }
}
```

##### ❌ WRONG Implementation

```typescript
// ❌ BAD: No user validation
@Injectable()
export class TweetService {
  async create(createTweetDto: CreateTweetDto) {
    const user = await this.userRepository.findOneBy({
      id: createTweetDto.userId,
    });

    // ❌ No check if user is null!
    const tweet = this.tweetRepository.create({
      ...createTweetDto,
      user,  // Could be null - will crash!
    });

    return this.tweetRepository.save(tweet);
  }

  // ❌ BAD: Not loading relations
  async findAll() {
    return this.tweetRepository.find();
    // user property will be undefined!
  }

  // ❌ BAD: Mixing concerns in one method
  async findAll(userId?: string) {
    if (userId) {
      // Complex logic mixing filtering and general query
      return this.tweetRepository.find({
        where: { user: { id: userId } },
        relations: ['user'],
      });
    }
    return this.tweetRepository.find({ relations: ['user'] });
    // Better to have separate methods
  }

  // ❌ BAD: Not returning updated entity
  async update(id: string, updateTweetDto: UpdateTweetDto) {
    return this.tweetRepository.update({ id }, updateTweetDto);
    // Returns { affected: 1 }, not the tweet!
  }

  // ❌ BAD: Using delete() instead of remove()
  async remove(id: string) {
    return this.tweetRepository.delete({ id });
    // Bypasses entity hooks and soft delete
  }
}
```

---

#### 4. Controller Implementation

##### ✅ CORRECT Implementation

```typescript
// src/app/tweet/tweet.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TweetService } from './tweet.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';

@Controller('tweets')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  // ✅ CORRECT: Validate DTO
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTweetDto: CreateTweetDto) {
    return this.tweetService.create(createTweetDto);
  }

  // ✅ CORRECT: Get all tweets
  @Get()
  findAll() {
    return this.tweetService.findAll();
  }

  // ✅ CORRECT: Separate endpoint for filtering
  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return this.tweetService.findByUser(userId);
  }

  // ✅ CORRECT: Validate UUID in param
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tweetService.findOne(id);
  }

  // ✅ CORRECT: Validate UUID and DTO
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTweetDto: UpdateTweetDto,
  ) {
    return this.tweetService.update(id, updateTweetDto);
  }

  // ✅ CORRECT: Returns 200 on success
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tweetService.remove(id);
  }
}
```

##### ❌ WRONG Implementation

```typescript
// ❌ BAD: Multiple issues
@Controller('tweet')  // ❌ Should be plural 'tweets'
export class TweetController {
  // ❌ BAD: No UUID validation
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tweetService.findOne(id);
  }

  // ❌ BAD: Wrong parameter decorator
  @Get()
  findAll(@Param('userId') userId: string) {
    // @Param requires route param like ':userId'
    // This will always be undefined
    return this.tweetService.findAll(userId);
  }

  // ❌ BAD: No HTTP status code
  @Post()
  create(@Body() createTweetDto: CreateTweetDto) {
    return this.tweetService.create(createTweetDto);
    // Returns 200 instead of 201
  }

  // ❌ BAD: Delete returns 204 by default
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tweetService.remove(id);
    // 204 No Content - response body ignored
  }
}
```

---

#### 5. Module Configuration

##### ✅ CORRECT Implementation

```typescript
// src/app/tweet/tweet.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet, User]),  // ✅ Import both entities
    // UsersModule,  // Optional: if you need UsersService
  ],
  controllers: [TweetController],
  providers: [TweetService],
  exports: [TweetService],  // ✅ Export if other modules need it
})
export class TweetModule {}
```

##### ❌ WRONG Implementation

```typescript
// ❌ BAD: Missing User entity import
@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet]),  // ❌ Missing User!
  ],
  controllers: [TweetController],
  providers: [TweetService],
})
export class TweetModule {}
// Error: User repository not found
```

---

### Common Patterns & Best Practices

#### Pattern 1: Creating Tweets with Nested User (Using Cascade)

```typescript
// In UsersService
async createUserWithTweets(userData: CreateUserDto) {
  const user = this.userRepository.create({
    email: userData.email,
    username: userData.username,
    tweets: [
      { title: 'My first tweet!', content: 'Hello World!', image: 'url' },
      { title: 'Second tweet', content: 'Learning NestJS', image: 'url' },
    ],
  });

  return this.userRepository.save(user);
  // ✅ Both user and tweets saved (cascade: ['insert'])
}
```

#### Pattern 2: Paginating Tweets

```typescript
async findAll(page: number = 1, limit: number = 20) {
  const [tweets, total] = await this.tweetRepository.findAndCount({
    relations: ['user'],
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: tweets,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

#### Pattern 3: Using QueryBuilder for Complex Queries

```typescript
async findTweetsWithFilters(filters: TweetFilterDto) {
  const query = this.tweetRepository
    .createQueryBuilder('tweet')
    .leftJoinAndSelect('tweet.user', 'user');

  if (filters.userId) {
    query.andWhere('tweet.userId = :userId', { userId: filters.userId });
  }

  if (filters.search) {
    query.andWhere(
      '(tweet.title ILIKE :search OR tweet.content ILIKE :search)',
      { search: `%${filters.search}%` }
    );
  }

  if (filters.startDate) {
    query.andWhere('tweet.createdAt >= :startDate', {
      startDate: filters.startDate,
    });
  }

  return query
    .orderBy('tweet.createdAt', 'DESC')
    .skip(filters.skip || 0)
    .take(filters.limit || 20)
    .getMany();
}
```

#### Pattern 4: Checking Ownership Before Update/Delete

```typescript
async update(userId: string, tweetId: string, updateDto: UpdateTweetDto) {
  const tweet = await this.tweetRepository.findOne({
    where: { id: tweetId },
    relations: ['user'],
  });

  if (!tweet) {
    throw new NotFoundException(`Tweet with ID ${tweetId} not found`);
  }

  // ✅ Check ownership
  if (tweet.user.id !== userId) {
    throw new ForbiddenException('You can only update your own tweets');
  }

  await this.tweetRepository.update({ id: tweetId }, updateDto);
  return this.findOne(tweetId);
}
```

#### Pattern 5: Soft Delete with Cascade

```typescript
// Entities already have @DeleteDateColumn
async remove(id: string) {
  const tweet = await this.findOne(id);
  return this.tweetRepository.softRemove(tweet);
  // Sets deletedAt timestamp, doesn't actually delete
}

// Alternative: Using softDelete() method
async softDelete(id: string) {
  return this.tweetRepository.softDelete({ id });
  // More efficient - doesn't load entity first
}

// Restore soft-deleted tweet
async restore(id: string) {
  await this.tweetRepository.restore({ id });
  return this.findOne(id);
}

// ⚠️ IMPORTANT: Default queries EXCLUDE soft-deleted entities
async findOne(id: string) {
  return this.tweetRepository.findOne({
    where: { id },
    relations: ['user', 'hashtags']
  });
  // This will return NULL if tweet is soft-deleted!
}

// ✅ Include soft-deleted in queries using withDeleted
async findOneIncludingDeleted(id: string) {
  return this.tweetRepository.findOne({
    where: { id },
    relations: ['user', 'hashtags'],
    withDeleted: true,  // ← Key option to include soft-deleted
  });
}

async findAllIncludingDeleted() {
  return this.tweetRepository.find({
    relations: ['user', 'hashtags'],
    withDeleted: true,  // Include soft-deleted
  });
}

// ✅ Using QueryBuilder for soft-deleted entities
async findDeletedTweets() {
  return this.tweetRepository
    .createQueryBuilder('tweet')
    .withDeleted()  // Include soft-deleted
    .where('tweet.deletedAt IS NOT NULL')  // Only deleted ones
    .leftJoinAndSelect('tweet.user', 'user')
    .leftJoinAndSelect('tweet.hashtags', 'hashtags')
    .getMany();
}
```

**🔑 Key Points About Soft Delete:**

1. **Default Behavior**: TypeORM automatically filters out entities where `deletedAt IS NOT NULL`
2. **Why Your Queries Don't Return Soft-Deleted Data**: You must explicitly add `withDeleted: true` to query options
3. **Difference Between Methods**:
   - `softRemove(entity)`: Requires loading entity first, triggers lifecycle hooks
   - `softDelete(criteria)`: Direct update, more efficient, no hooks
4. **QueryBuilder Support**: Use `.withDeleted()` method when using QueryBuilder
5. **Relations Consideration**: Soft-deleted parent entities are excluded even when loading relations

---

### Testing Examples

```typescript
// tweet.service.spec.ts
describe('TweetService', () => {
  let service: TweetService;
  let tweetRepository: Repository<Tweet>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetService,
        {
          provide: getRepositoryToken(Tweet),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TweetService>(TweetService);
    tweetRepository = module.get(getRepositoryToken(Tweet));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a tweet with valid user', async () => {
      const createDto = {
        title: 'Test Tweet',
        content: 'Test Content',
        image: 'test.jpg',
        userId: 'user-uuid',
      };

      const mockUser = { id: 'user-uuid', email: 'test@example.com' };
      const mockTweet = { ...createDto, user: mockUser, id: 'tweet-uuid' };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(tweetRepository, 'create').mockReturnValue(mockTweet as Tweet);
      jest.spyOn(tweetRepository, 'save').mockResolvedValue(mockTweet as Tweet);

      const result = await service.create(createDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: createDto.userId });
      expect(tweetRepository.create).toHaveBeenCalledWith({
        ...createDto,
        user: mockUser,
      });
      expect(result).toEqual(mockTweet);
    });

    it('should throw NotFoundException if user not found', async () => {
      const createDto = {
        title: 'Test',
        content: 'Content',
        image: 'img.jpg',
        userId: 'invalid-uuid',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

### Key Concepts: What to Remember & What NOT to Do

This section summarizes critical concepts for OneToMany/ManyToOne relationships using our **User-Tweet** implementation as reference.

#### ✅ MUST REMEMBER

**1. Foreign Key Location**
```typescript
// ✅ Foreign key ALWAYS lives on the @ManyToOne side
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)
  user: User;  // This creates 'userId' column in tweets table
}
```
**Why:** Many tweets → One user. The "many" side holds the reference.

**2. @OneToMany Cannot Exist Without @ManyToOne**
```typescript
// ❌ WRONG - This will FAIL
@Entity()
export class User {
  @OneToMany(() => Tweet)  // Missing inverse relation!
  tweets: Tweet[];
}

// ✅ CORRECT - Must have @ManyToOne on Tweet entity
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)  // Points to inverse
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets)  // Required!
  user: User;
}
```
**Why:** TypeORM needs to know which property on Tweet references the User.

**3. @ManyToOne CAN Exist Alone (Unidirectional)**
```typescript
// ✅ VALID - Unidirectional relationship
@Entity()
export class Tweet {
  @ManyToOne(() => User)  // No inverse callback needed
  user: User;
}

@Entity()
export class User {
  // No @OneToMany needed if you don't need user.tweets
}
```
**Use when:** You only need to access `tweet.user`, never `user.tweets`.

**4. Two Types of Cascade - Don't Confuse Them!**

**Database Cascade (onDelete) - On @ManyToOne side:**
```typescript
@Entity()
export class Tweet {
  @ManyToOne(() => User, (user) => user.tweets, {
    onDelete: 'CASCADE'  // Database handles deletion
  })
  user: User;
}
```
- **Runs:** When you DELETE from database directly
- **Behavior:** Delete user → Database auto-deletes tweets
- **Options:** CASCADE, SET NULL, RESTRICT, NO ACTION

**Application Cascade (cascade) - On @OneToMany side:**
```typescript
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update']  // TypeORM handles saves
  })
  tweets: Tweet[];
}
```
- **Runs:** When you save through TypeORM
- **Behavior:** Save user with nested tweets → TypeORM saves both
- **Options:** insert, update, remove, soft-remove, recover

**5. nullable: false vs nullable: true**
```typescript
// ✅ Business logic: Every tweet MUST have a user
@Entity()
export class Tweet {
  @ManyToOne(() => User, {
    nullable: false  // userId column is NOT NULL in database
  })
  user: User;
}

// ⚠️ Use nullable: true only if the relationship is optional
@Entity()
export class Tweet {
  @ManyToOne(() => User, {
    nullable: true  // Tweet can exist without a user
  })
  user: User | null;  // TypeScript type should match
}
```

**6. @JoinColumn is Optional for @ManyToOne**
```typescript
// Both are equivalent:

// Without @JoinColumn - TypeORM auto-creates 'userId'
@ManyToOne(() => User, (user) => user.tweets)
user: User;

// With @JoinColumn - Explicit column name (recommended for clarity)
@ManyToOne(() => User, (user) => user.tweets)
@JoinColumn({ name: 'userId' })
user: User;
```
**Recommendation:** Use explicit `@JoinColumn({ name: 'userId' })` for code clarity.

**7. Index Foreign Keys for Performance**
```typescript
// ✅ GOOD: Index on foreign key column
@Entity()
@Index(['userId'])  // Or use column name directly
export class Tweet {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```
**Why:** Improves JOIN query performance significantly.

**8. DTOs Should Use Foreign Key IDs, Not Full Entities**
```typescript
// ❌ WRONG - Don't use full entity in DTO
export class CreateTweetDto {
  title: string;
  user: User;  // ❌ Bad!
}

// ✅ CORRECT - Use foreign key ID
export class CreateTweetDto {
  title: string;

  @IsUUID('4')
  userId: string;  // ✅ Good!
}
```

**9. Always Validate Foreign Key Exists in Service**
```typescript
// ✅ CORRECT Service Implementation
async create(createTweetDto: CreateTweetDto) {
  // 1. Validate user exists
  const user = await this.userRepository.findOneBy({
    id: createTweetDto.userId
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${createTweetDto.userId} not found`);
  }

  // 2. Create tweet with validated user
  const tweet = this.tweetRepository.create({
    ...createTweetDto,
    user: user  // Assign full entity, not just ID
  });

  return this.tweetRepository.save(tweet);
}
```

**10. Loading Relations Explicitly**
```typescript
// ❌ Relations NOT loaded by default
const tweet = await this.tweetRepository.findOne({
  where: { id }
});
console.log(tweet.user);  // undefined!

// ✅ CORRECT - Load relations explicitly
const tweet = await this.tweetRepository.findOne({
  where: { id },
  relations: ['user']  // Now tweet.user is loaded
});
console.log(tweet.user);  // User object
```

#### ❌ COMMON MISTAKES TO AVOID

**1. DON'T put cascade: ['remove'] on @OneToMany if you have onDelete: 'CASCADE' on @ManyToOne**
```typescript
// ❌ CONFLICT - Both handle deletion differently!
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['remove']  // Application-level cascade
  })
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'  // Database-level cascade
  })
  user: User;
}

// ✅ CORRECT - Choose ONE deletion strategy
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    cascade: ['insert', 'update']  // Only save cascades
  })
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'  // Handle deletion at database level
  })
  user: User;
}
```

**2. DON'T forget to import both repositories in the service**
```typescript
// ❌ WRONG - Only Tweet repository
@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
  ) {}
}

// ✅ CORRECT - Both repositories for validation
@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,  // Needed for validation!
  ) {}
}
```

**3. DON'T allow userId changes in UpdateDto**
```typescript
// ❌ WRONG - Allows changing tweet's user
export class UpdateTweetDto extends PartialType(CreateTweetDto) {
  // This includes userId - dangerous!
}

// ✅ CORRECT - Exclude userId from updates
export class UpdateTweetDto extends PartialType(
  OmitType(CreateTweetDto, ['userId'])
) {
  // userId cannot be changed
}
```

**4. DON'T use eager: true on both sides**
```typescript
// ❌ WRONG - Circular eager loading!
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user, {
    eager: true  // Loads tweets when fetching user
  })
  tweets: Tweet[];
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, {
    eager: true  // Loads user when fetching tweet → loads tweets → infinite!
  })
  user: User;
}

// ✅ CORRECT - Eager on one side only, or neither
@Entity()
export class User {
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];  // Load explicitly with relations: ['tweets']
}

@Entity()
export class Tweet {
  @ManyToOne(() => User, {
    eager: true  // OK - loads user when fetching tweet
  })
  user: User;
}
```

**5. DON'T forget to register both entities in the module**
```typescript
// ❌ WRONG - Only Tweet entity
@Module({
  imports: [TypeOrmModule.forFeature([Tweet])],
  // ...
})

// ✅ CORRECT - Both entities
@Module({
  imports: [TypeOrmModule.forFeature([Tweet, User])],
  // ...
})
```

#### 🎯 Your Current Implementation Analysis

**User Entity (user.entity.ts:51-54):**
```typescript
@OneToMany(() => Tweet, (tweet) => tweet.user, {
  cascade: ['insert', 'update'],  // ✅ Good - Application cascade for saves
})
tweets: Tweet[];
```
**Status:** ✅ Correct

**Tweet Entity (tweet.entity.ts:42-47):**
```typescript
@ManyToOne(() => User, (user) => user.tweets, {
  nullable: false,        // ✅ Good - Tweet must have user
  onDelete: 'CASCADE',    // ✅ Good - Database cascade for deletes
})
@JoinColumn({ name: 'userId' })  // ✅ Good - Explicit column name
user: User;
```
**Status:** ✅ Correct

**Index (tweet.entity.ts:15):**
```typescript
@Index(['user'])  // ⚠️ Should be ['userId'] for clarity
```
**Minor Issue:** Using property name instead of column name. Both work, but `['userId']` is clearer.

#### 📊 Quick Decision Matrix

| Scenario | Use @OneToMany? | Use @ManyToOne? | cascade | onDelete |
|----------|----------------|-----------------|---------|----------|
| Need user.tweets access | ✅ Yes | ✅ Yes | ['insert', 'update'] | CASCADE |
| Only need tweet.user | ❌ No | ✅ Yes | - | CASCADE/SET NULL |
| Nested save user+tweets | ✅ Yes | ✅ Yes | ['insert', 'update'] | - |
| Delete user → delete tweets | Either side | Either side | - | CASCADE |
| Optional relationship | ✅ Yes | ✅ Yes (nullable: true) | - | SET NULL |

---

### Quick Reference Checklist

When implementing One-to-Many relationships:

**Entities:**
- [ ] `@ManyToOne` on the "many" side with `nullable: false` and `onDelete: 'CASCADE'`
- [ ] `@OneToMany` on the "one" side with `cascade: ['insert', 'update']`
- [ ] `@Index()` on foreign key column for performance
- [ ] Both sides have inverse relation callbacks

**DTOs:**
- [ ] Use foreign key ID (`userId: string`), not full entity
- [ ] Validate UUID format with `@IsUUID('4')`
- [ ] Exclude foreign key from update DTOs with `OmitType`

**Service:**
- [ ] Validate foreign entity exists before creating
- [ ] Throw `NotFoundException` if not found
- [ ] Load relations explicitly with `relations: []`
- [ ] Return full entity from update methods

**Controller:**
- [ ] Use `ParseUUIDPipe` for UUID parameters
- [ ] Set appropriate HTTP status codes
- [ ] Separate endpoints for different queries
- [ ] Use proper plural naming (`/tweets` not `/tweet`)

**Module:**
- [ ] Import both entities in `TypeOrmModule.forFeature([])`
- [ ] Export service if other modules need it

---

## Many-to-Many

Many-to-Many relationships occur when **multiple instances of entity A can relate to multiple instances of entity B, and vice versa**. Example: Tweets can have multiple hashtags, and hashtags can be used in multiple tweets.

---

### Example: Tweet ↔ Hashtags (Unidirectional)

---

### Database Schema

```sql
-- Tweet table
CREATE TABLE "tweet" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" varchar(100) NOT NULL,
  "content" varchar(300) NOT NULL,
  "image" varchar(200) NOT NULL,
  "userId" uuid NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP NULL,

  CONSTRAINT "FK_tweet_user" FOREIGN KEY ("userId")
    REFERENCES "user"("id") ON DELETE CASCADE
);

-- Hashtag table
CREATE TABLE "hashtag" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(50) UNIQUE NOT NULL
);

-- Junction table (created automatically by TypeORM)
CREATE TABLE "tweet_hashtags" (
  "tweetId" uuid NOT NULL,
  "hashtagId" uuid NOT NULL,

  PRIMARY KEY ("tweetId", "hashtagId"),  -- Composite primary key

  CONSTRAINT "FK_tweet_hashtags_tweet" FOREIGN KEY ("tweetId")
    REFERENCES "tweet"("id") ON DELETE CASCADE,

  CONSTRAINT "FK_tweet_hashtags_hashtag" FOREIGN KEY ("hashtagId")
    REFERENCES "hashtag"("id") ON DELETE CASCADE
);

-- Indexes on foreign keys (created automatically by TypeORM)
CREATE INDEX "IDX_tweet_hashtags_tweetId" ON "tweet_hashtags"("tweetId");
CREATE INDEX "IDX_tweet_hashtags_hashtagId" ON "tweet_hashtags"("hashtagId");
```

**Key Points:**
- Junction table `tweet_hashtags` connects tweets and hashtags
- Composite primary key prevents duplicate relationships
- Foreign keys with CASCADE delete junction records when parent deleted
- Hashtag entity itself is NOT deleted (shared resource)

---

### Understanding the Relationship

**Unidirectional vs Bidirectional:**

| Type | Definition | Access Pattern | Use Case |
|------|-----------|----------------|----------|
| **Unidirectional** | Relation defined on ONE side only | Can only query from owning side | Simpler, less coupling |
| **Bidirectional** | Relation defined on BOTH sides | Can query from either direction | Full flexibility |

**Our Implementation: Unidirectional**
- Tweet knows its hashtags: ✅ `tweet.hashtags`
- Hashtag doesn't know its tweets: ❌ `hashtag.tweets` not defined
- Why? Hashtags are shared resources, typically queried by name, not by tweets

---

### Entity Configuration

#### ✅ Tweet Entity (Owning Side)

```typescript
// src/app/tweet/entities/tweet.entity.ts
import { Hashtag } from 'src/app/hashtags/entities/hashtag.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 300 })
  content: string;

  // ✅ CORRECT: ManyToMany with explicit JoinTable configuration
  @ManyToMany(() => Hashtag, {
    cascade: ['insert'],  // Auto-insert new hashtags
    eager: false,         // Don't auto-load (explicit is better)
  })
  @JoinTable({
    name: 'tweet_hashtags',  // Junction table name
    joinColumn: {
      name: 'tweetId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'hashtagId',
      referencedColumnName: 'id',
    },
  })
  hashtags: Hashtag[];

  // Note: No cascade delete - hashtags are shared resources
  // Junction table records auto-deleted via FK CASCADE
}
```

#### ✅ Hashtag Entity (Inverse Side - None)

```typescript
// src/app/hashtags/entities/hashtag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Hashtag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  // No reference to Tweet - truly unidirectional ✅
}
```

---

### Critical Rules for Many-to-Many

#### Rule 1: @JoinTable is Required

```typescript
// ❌ WRONG - Missing @JoinTable
@Entity()
export class Tweet {
  @ManyToMany(() => Hashtag)
  hashtags: Hashtag[];  // Error: JoinTable required!
}

// ✅ CORRECT
@Entity()
export class Tweet {
  @ManyToMany(() => Hashtag)
  @JoinTable()  // Required for many-to-many!
  hashtags: Hashtag[];
}
```

**Why @JoinTable?**
- Tells TypeORM which side "owns" the relationship
- Creates the junction table
- Only ONE side can have @JoinTable

---

#### Rule 2: @JoinTable Only on ONE Side

```typescript
// ❌ WRONG - @JoinTable on both sides (bidirectional)
@Entity()
export class Tweet {
  @ManyToMany(() => Hashtag)
  @JoinTable()  // ❌
  hashtags: Hashtag[];
}

@Entity()
export class Hashtag {
  @ManyToMany(() => Tweet)
  @JoinTable()  // ❌ Error: Only one side can have JoinTable!
  tweets: Tweet[];
}

// ✅ CORRECT - @JoinTable on ONE side only
@Entity()
export class Tweet {
  @ManyToMany(() => Hashtag, (hashtag) => hashtag.tweets)
  @JoinTable()  // ✅ Owning side
  hashtags: Hashtag[];
}

@Entity()
export class Hashtag {
  @ManyToMany(() => Tweet, (tweet) => tweet.hashtags)
  // No @JoinTable here - inverse side
  tweets: Tweet[];
}
```

---

#### Rule 3: Explicit Junction Table Configuration (Recommended)

```typescript
// ⚠️ OK but not ideal - TypeORM auto-generates names
@JoinTable()

// ✅ BETTER - Explicit configuration
@JoinTable({
  name: 'tweet_hashtags',  // Clear table name
  joinColumn: {
    name: 'tweetId',
    referencedColumnName: 'id'
  },
  inverseJoinColumn: {
    name: 'hashtagId',
    referencedColumnName: 'id'
  }
})
```

**Why explicit?**
- Predictable table/column names
- Clearer migrations
- Better database documentation

---

#### Rule 4: Use save() for Updates, NOT update()

```typescript
// ❌ WRONG - update() doesn't handle many-to-many relations
async updateTweet(id: string, hashtags: Hashtag[]) {
  await this.tweetRepository.update({ id }, { hashtags });
  // Junction table NOT updated! ❌
}

// ✅ CORRECT - save() properly handles many-to-many
async updateTweet(id: string, hashtags: Hashtag[]) {
  const tweet = await this.tweetRepository.findOne({
    where: { id },
    relations: ['hashtags']
  });

  tweet.hashtags = hashtags;  // Replace hashtags
  await this.tweetRepository.save(tweet);  // Updates junction table ✅
}
```

---

### Cascade Operations

#### cascade: ['insert'] - Auto-Create Related Entities

```typescript
@ManyToMany(() => Hashtag, {
  cascade: ['insert'],  // Create new hashtags automatically
})
@JoinTable()
hashtags: Hashtag[];

// Usage
const tweet = tweetRepository.create({
  title: 'My Tweet',
  hashtags: [
    { name: 'typescript' },  // Will be created automatically
    { name: 'nestjs' }       // Will be created automatically
  ]
});

await tweetRepository.save(tweet);
// Both tweet AND new hashtags saved in one operation! ✅

// Generated SQL:
// START TRANSACTION
// INSERT INTO hashtag (name) VALUES ('typescript') RETURNING id
// INSERT INTO hashtag (name) VALUES ('nestjs') RETURNING id
// INSERT INTO tweet (title) VALUES ('My Tweet') RETURNING id
// INSERT INTO tweet_hashtags (tweetId, hashtagId) VALUES ($1, $2)
// INSERT INTO tweet_hashtags (tweetId, hashtagId) VALUES ($1, $3)
// COMMIT
```

---

#### No Cascade Delete for Shared Resources

```typescript
@ManyToMany(() => Hashtag, {
  // NO cascade: ['remove'] - hashtags are shared!
})
@JoinTable({
  // FK CASCADE handles junction table cleanup
})
hashtags: Hashtag[];
```

**Why no cascade delete?**
- Hashtags used by multiple tweets
- Deleting tweet shouldn't delete hashtags
- Junction table records auto-deleted by FK CASCADE

**What gets deleted:**
```sql
-- When you delete a tweet:
DELETE FROM tweet WHERE id = 'tweet-123';

-- Automatically triggered by FK CASCADE:
DELETE FROM tweet_hashtags WHERE tweetId = 'tweet-123';

-- Hashtag entity remains:
SELECT * FROM hashtag;  -- ✅ Still there
```

---

### Loading Relations

#### 1. Explicit Loading with relations

```typescript
// ❌ Relations NOT loaded by default
const tweet = await tweetRepository.findOne({
  where: { id: tweetId }
});
console.log(tweet.hashtags);  // undefined ❌

// ✅ CORRECT - Load explicitly
const tweet = await tweetRepository.findOne({
  where: { id: tweetId },
  relations: ['hashtags']  // Load hashtags
});
console.log(tweet.hashtags);  // Array of hashtags ✅
```

#### 2. QueryBuilder with leftJoinAndSelect

```typescript
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .leftJoinAndSelect('tweet.hashtags', 'hashtag')
  .where('hashtag.name = :name', { name: 'nestjs' })
  .getMany();

// SQL Generated:
// SELECT tweet.*, hashtag.*
// FROM tweet
// LEFT JOIN tweet_hashtags ON tweet.id = tweet_hashtags.tweetId
// LEFT JOIN hashtag ON tweet_hashtags.hashtagId = hashtag.id
// WHERE hashtag.name = 'nestjs'
```

#### 3. Eager Loading (Use Carefully)

```typescript
@ManyToMany(() => Hashtag, {
  eager: true  // Always load hashtags automatically
})
@JoinTable()
hashtags: Hashtag[];

// Now hashtags loaded automatically
const tweet = await tweetRepository.findOne({
  where: { id: tweetId }
  // No need to specify relations
});
console.log(tweet.hashtags);  // ✅ Loaded

// ⚠️ WARNING: Eager disabled in QueryBuilder!
const tweets = await tweetRepository
  .createQueryBuilder('tweet')
  .getMany();
console.log(tweets[0].hashtags);  // undefined! Must use leftJoinAndSelect
```

---

### Complete Working Example

#### 1. DTOs

```typescript
// src/app/tweet/dto/create-tweet.dto.ts
export class CreateTweetDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  // ✅ Use array of IDs, not full entities
  @IsOptional()
  @IsUUID('4', { each: true })
  hashtagsIds?: string[];
}

// src/app/tweet/dto/update-tweet.dto.ts
export class UpdateTweetDto extends PartialType(
  OmitType(CreateTweetDto, ['userId'])
) {}
// Includes optional hashtagsIds
```

#### 2. Service Implementation

```typescript
// src/app/tweet/tweet.service.ts
@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
    private hashtagsService: HashtagsService,
  ) {}

  // ✅ CREATE - Fetch hashtags and assign
  async create(dto: CreateTweetDto) {
    let hashtags: Hashtag[] = [];

    if (dto.hashtagsIds?.length > 0) {
      hashtags = await this.hashtagsService.findByIds(dto.hashtagsIds);
    }

    const tweet = this.tweetRepository.create({
      ...dto,
      hashtags,
    });

    return this.tweetRepository.save(tweet);
  }

  // ✅ FIND ALL - Load relations explicitly
  async findAll(userId: string) {
    return this.tweetRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'hashtags'],  // Load both relations
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ FIND ONE - Load relations
  async findOne(id: string) {
    return this.tweetRepository.findOne({
      where: { id },
      relations: ['user', 'hashtags'],
    });
  }

  // ✅ UPDATE - Use save() not update()
  async update(id: string, dto: UpdateTweetDto) {
    // Load existing tweet with relations
    const tweet = await this.tweetRepository.findOne({
      where: { id },
      relations: ['user', 'hashtags'],
    });

    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }

    // Update hashtags if provided
    if (dto.hashtagsIds) {
      if (dto.hashtagsIds.length > 0) {
        tweet.hashtags = await this.hashtagsService.findByIds(
          dto.hashtagsIds
        );
      } else {
        tweet.hashtags = [];  // Clear all hashtags
      }
    }

    // Update other fields
    Object.assign(tweet, {
      title: dto.title ?? tweet.title,
      content: dto.content ?? tweet.content,
      image: dto.image ?? tweet.image,
    });

    // Use save() to update many-to-many relations
    return this.tweetRepository.save(tweet);
  }

  // ✅ DELETE - Junction records auto-deleted by FK
  async remove(id: string) {
    return this.tweetRepository.delete({ id });
    // tweet_hashtags records automatically deleted ✅
    // hashtag entities remain ✅
  }
}
```

#### 3. Hashtags Service

```typescript
// src/app/hashtags/hashtags.service.ts
@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(Hashtag)
    private hashtagRepository: Repository<Hashtag>,
  ) {}

  async findByIds(ids: string[]) {
    return this.hashtagRepository.find({
      where: { id: In(ids) },  // Use In() operator
    });
  }

  async findByNames(names: string[]) {
    return this.hashtagRepository.find({
      where: { name: In(names) },
    });
  }

  async createIfNotExists(names: string[]): Promise<Hashtag[]> {
    const hashtags: Hashtag[] = [];

    for (const name of names) {
      let hashtag = await this.hashtagRepository.findOne({
        where: { name },
      });

      if (!hashtag) {
        hashtag = await this.hashtagRepository.save({ name });
      }

      hashtags.push(hashtag);
    }

    return hashtags;
  }
}
```

#### 4. Module Configuration

```typescript
// tweet.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet, Hashtag]),  // Both entities
    HashtagsModule,  // Import to use HashtagsService
  ],
  controllers: [TweetController],
  providers: [TweetService],
  exports: [TweetService],
})
export class TweetModule {}

// hashtags.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Hashtag])],
  controllers: [HashtagsController],
  providers: [HashtagsService],
  exports: [HashtagsService],  // ✅ Export for use in TweetModule
})
export class HashtagsModule {}
```

---

### Bidirectional Many-to-Many (Optional)

If you need to query hashtags by tweets (bi-directional navigation):

```typescript
// Tweet entity (owning side)
@Entity()
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 300 })
  content: string;

  // ✅ OWNING SIDE: Has @JoinTable
  @ManyToMany(() => Hashtag, (hashtag) => hashtag.tweets, {
    cascade: ['insert'],  // Auto-insert new hashtags
    eager: false,         // Don't auto-load
  })
  @JoinTable({
    name: 'tweet_hashtags',
    joinColumn: {
      name: 'tweetId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'hashtagId',
      referencedColumnName: 'id',
    },
  })
  hashtags: Hashtag[];
}

// Hashtag entity (inverse side)
@Entity()
export class Hashtag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  // ✅ INVERSE SIDE: No @JoinTable, but HAS onDelete to allow deletion
  @ManyToMany(() => Tweet, (tweet) => tweet.hashtags, {
    onDelete: 'CASCADE',  // Allow deleting hashtags even when used by tweets
  })
  tweets: Tweet[];
}

// Now you can query both ways:

// 1️⃣ Get tweet with its hashtags
const tweet = await tweetRepo.findOne({
  where: { id },
  relations: ['hashtags']
});
console.log(tweet.hashtags);  // ✅ Array of Hashtag objects

// 2️⃣ Get hashtag with all tweets using it
const hashtag = await hashtagRepo.findOne({
  where: { name: 'nestjs' },
  relations: ['tweets']
});
console.log(hashtag.tweets);  // ✅ Array of Tweet objects
```

**⚠️ Critical Rules for Bidirectional Many-to-Many:**

1. **@JoinTable Only on One Side**: The owning side (Tweet) has `@JoinTable`, the inverse side (Hashtag) does not
2. **Configure onDelete on Inverse Side**: Add `onDelete: 'CASCADE'` to `@ManyToMany()` on inverse side (Hashtag) to allow deleting that entity even when it's in use
3. **Both Sides Reference Each Other**: Use second parameter in `@ManyToMany()` to link both directions
4. **Don't Use eager: true on Both Sides**: Causes infinite loops and circular dependencies
5. **Junction Table Structure**: Owning side's `@JoinTable` defines table name and columns, but inverse side's `onDelete` controls its FK constraint
6. **Different onDelete for Each Side**: Owning side can have its own `onDelete` (controls tweetId FK), inverse side has separate `onDelete` (controls hashtagId FK)

---

### Best Practices

#### ✅ DO

**1. Use Explicit Junction Table Configuration**
```typescript
@JoinTable({
  name: 'tweet_hashtags',
  joinColumn: { name: 'tweetId' },
  inverseJoinColumn: { name: 'hashtagId' }
})
```

**2. Use Unidirectional for Simpler Relations**
- Less code, less coupling
- Only add bidirectional if needed

**3. Load Relations Explicitly**
```typescript
relations: ['hashtags']
```

**4. Use save() for Updates**
```typescript
tweet.hashtags = newHashtags;
await repo.save(tweet);  // ✅
```

**5. Use Array of IDs in DTOs**
```typescript
hashtagsIds: string[]  // ✅ Not: hashtags: Hashtag[]
```

**6. Consider cascade: ['insert'] for Convenience**
```typescript
@ManyToMany(() => Hashtag, {
  cascade: ['insert']  // Auto-create new hashtags
})
```

---

#### ❌ DON'T

**1. Don't Forget @JoinTable**
```typescript
// ❌ Missing @JoinTable
@ManyToMany(() => Hashtag)
hashtags: Hashtag[];
```

**2. Don't Put @JoinTable on Both Sides**
```typescript
// ❌ Both have @JoinTable
@ManyToMany(() => Hashtag)
@JoinTable()  // Only on ONE side!
```

**3. Don't Use update() for Many-to-Many**
```typescript
// ❌ Doesn't update junction table
await repo.update({ id }, { hashtags });

// ✅ Use save()
const entity = await repo.findOne({ where: { id }, relations: ['hashtags'] });
entity.hashtags = newHashtags;
await repo.save(entity);
```

**4. Don't Cascade Delete Shared Resources**
```typescript
// ❌ Bad for shared hashtags
@ManyToMany(() => Hashtag, {
  cascade: ['remove']  // Deletes hashtags!
})
```

**5. Don't Use eager: true on Both Sides (Bidirectional)**
```typescript
// ❌ Circular loading
@ManyToMany(() => Hashtag, { eager: true })
hashtags: Hashtag[];

@ManyToMany(() => Tweet, { eager: true })  // ❌ Infinite loop!
tweets: Tweet[];
```

**6. Don't Forget Relations in Queries**
```typescript
// ❌ hashtags undefined
const tweet = await repo.findOne({ where: { id } });

// ✅ Load relations
const tweet = await repo.findOne({
  where: { id },
  relations: ['hashtags']
});
```

**7. Configure onDelete CASCADE on Inverse Side (Bidirectional)**
```typescript
// Tweet entity (OWNING side with @JoinTable)
@Entity()
export class Tweet {
  @ManyToMany(() => Hashtag, (hashtag) => hashtag.tweets, {
    cascade: ['insert'],
    eager: false,
  })
  @JoinTable({
    name: 'tweet_hashtags',
    joinColumn: { name: 'tweetId' },
    inverseJoinColumn: { name: 'hashtagId' },
  })
  hashtags: Hashtag[];
}

// Hashtag entity (INVERSE side)
@Entity()
export class Hashtag {
  @ManyToMany(() => Tweet, (tweet) => tweet.hashtags, {
    onDelete: 'CASCADE',  // ✅ Allows deleting hashtags even when used by tweets
  })
  tweets: Tweet[];
}

// 🔑 KEY UNDERSTANDING:
// - onDelete on INVERSE side (Hashtag) → Controls FK from junction table hashtagId to hashtag.id
// - This allows DELETE hashtag operations even when junction table references it
// - Without CASCADE: Error "violates foreign key constraint on junction table"
// - With CASCADE: Junction table rows automatically deleted when hashtag deleted
```

---

### Quick Reference Checklist

When implementing Many-to-Many relationships:

**Entities:**
- [ ] `@ManyToMany(() => Target)` on owning side
- [ ] `@JoinTable({ name, joinColumn, inverseJoinColumn })` on owning side only
- [ ] Consider `cascade: ['insert']` for auto-creating related entities
- [ ] Set `eager: false` (explicit loading recommended)
- [ ] No `cascade: ['remove']` if target is shared resource

**DTOs:**
- [ ] Use array of IDs (`targetIds: string[]`), not full entities
- [ ] Validate with `@IsUUID('4', { each: true })`
- [ ] Make optional with `@IsOptional()`

**Service:**
- [ ] Fetch related entities by IDs using `In()` operator
- [ ] Load relations with `relations: ['target']`
- [ ] Use `save()` for updates, NOT `update()`
- [ ] Return full entity with relations from update methods

**Module:**
- [ ] Import both entities in `TypeOrmModule.forFeature([Entity1, Entity2])`
- [ ] Import related module if using its service
- [ ] Export service if other modules need it

---

## Additional Resources

- [TypeORM Relations Documentation](https://typeorm.io/relations)
- [NestJS Database Documentation](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
