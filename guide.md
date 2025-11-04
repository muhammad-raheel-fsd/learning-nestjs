# TypeORM Relationships Guide

A comprehensive guide to understanding TypeORM relationships with practical examples from this NestJS project.

---

## Table of Contents
1. [PostgreSQL Keys & Constraints](#postgresql-keys--constraints)
2. [One-to-One Relationship](#one-to-one-relationship)
3. [One-to-Many / Many-to-One](#one-to-many--many-to-one) *(Coming soon)*
4. [Many-to-Many](#many-to-many) *(Coming soon)*

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
Remeber when we have many to one relationsthip, foreign key is always stored in table of many side
*Coming soon...*

---

## Many-to-Many

*Coming soon...*

---

## Additional Resources

- [TypeORM Relations Documentation](https://typeorm.io/relations)
- [NestJS Database Documentation](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
