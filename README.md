# CDMS Frontend - Case Data Management System

A web-based Case Data Management System (CDMS) frontend built with Node.js, Express, and EJS. This application provides a user-friendly interface for managing cases, records, policies, and user access control with organization-based separation.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
  - [Authentication](#authentication)
  - [User Registration](#user-registration)
  - [User Login](#user-login)
  - [Admin Privileges](#admin-privileges)
  - [Cases Management](#cases-management)
  - [Records Management](#records-management)
  - [Access Control & Policies](#access-control--policies)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CDMS Frontend is a comprehensive web application designed to manage cases, records, and access policies across multiple organizations. It provides role-based access control (RBAC) where different user roles (Admin, User) have varying levels of privileges. The system supports policy-based access control for managing who can view and modify records associated with cases.

---

## Features

### 🔐 Authentication & Authorization
- User registration with email and organization assignment
- Secure login with JWT-based sessions
- Role-based access control (Admin/User roles)
- Organization-based data separation

### 📁 Cases Management
- Create new cases with metadata
- View list of cases
- Access detailed case information
- Cases are organization-specific

### 📊 Records Management
- Upload and manage case records
- Support for multiple file types
- Record metadata management

### 🔗 Access Control & Policies
- Policy-based access control (PBAC)
- Create and manage access policies
- Define who can access specific cases and records
- Policy enforcement based on user roles and organizations
- Granular permission management

### 👥 User Management
- User profile management
- Organization assignment for users

### 📊 Dashboard
- Overview of system statistics
- Quick access to key features
- Organization-specific metrics

---

## Prerequisites

Before setting up the CDMS Frontend, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **CDMS Backend** running on port 3000 (see Backend Setup section below)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

---

## Setup Instructions

### Step 1: Clone or Navigate to the Repository

```bash
cd cdms-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Create Environment Configuration

Create a `.env` file in the root directory of the `cdms-frontend` folder with the following content:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
SESSION_SECRET=your-session-secret-key-change-this

# Backend API Configuration
BACKEND_URL=http://localhost:3000
BACKEND_ORG1=Org1MSP
BACKEND_ORG2=Org2MSP
```

### Step 4: Ensure Backend is Running

**Important:** Before starting the frontend, make sure the CDMS Backend is running on port 3000.


### Step 5: Start the Frontend Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port for the frontend application | 3001 |
| `NODE_ENV` | Application environment (development/production) | development |
| `SESSION_SECRET` | Secret key for session encryption | your-session-secret-key-change-this |
| `BACKEND_URL` | URL of the CDMS Backend API | http://localhost:3000 |
| `BACKEND_ORG1` | First organization MSP ID | Org1MSP |
| `BACKEND_ORG2` | Second organization MSP ID | Org2MSP |

### Important Notes

- **Backend Connectivity**: Ensure `BACKEND_URL` matches your backend server address
- **Port Configuration**: Make sure port 3001 is not already in use

---

## Usage Guide

### Authentication

#### User Registration

**Access**: `/auth/register` or click "Register" on the login page
**Steps**:
1. Navigate to the registration page
2. Enter the following information:
    - **Name**: Your Full Name
    - **Username**: Your username
   - **Email**: Your email address
   - **Password**: A strong password
   - **Organization**: Select your organization from the dropdown
   - **Role**: Select your role from the dropdown
3. Click "Register"
4. Success message will appear

#### User Login

**Access**: `/auth/login` or the home page
**Steps**:
1. Enter your username
2. Enter your password
3. Click "Login"
4. Upon successful authentication, you'll be redirected to the dashboard

---

### Admin Privileges

**Who is an Admin?**: Users with the "Admin" role assigned to their account

**Admin Capabilities**:

#### 1. **Policy Management**
   - Create new access policies
   - Define access rules for cases and records
   - View policy assignments

#### 2. **Cases Management**
   - Create, edit, and delete cases for the organization
   - Set case-level access policies

#### 3. **Records Management**
   - Upload records to cases
   - Apply policies to records
   - Delete records

#### 5. **Organization Control**
   - View all organization data

---

### Cases Management

#### Creating a Case
**Prerequisites**: 
- You must be logged in
- You must be an Admin or have case creation privileges
**Access**: Dashboard → Cases → "Create New Case" or `/cases/create`
**Steps**:
1. Click on "Cases" in the navigation menu
2. Click "Create New Case"
3. Fill in the following information:
   - **Case Title**: A descriptive name for the case
   - **Case Description**: Detailed information about the case
   - **Jurisdiction**: Jurisdiction to which case belongs
   - **Case Type**: Case Type
   - **Status**: Select from available statuses (e.g., Open, In Progress, Closed)
   - **Policy**: Select Policy from dropdown
4. Click "Create Case"
5. The case will be created and you'll be redirected to the case details page


#### Viewing Cases
**Access**: Dashboard → Cases or `/cases/list`
**Features**:
- View all cases your organization has access to
- See case title, status, etc
- Click on a case to view detailed information


#### Case Details
**Information Displayed**:
- Case ID and title
- Case description and status
- Associated records
- Access policies applied

#### Deleting a Case
**Steps**:
1. Open a case from the cases list
2. Click "Delete Case"
3. Confirm the deletion in the dialog box
4. The case will be permanently deleted

---

### Records Management

#### Creating Records
**Prerequisites**:
- You must be logged in
- A case must already exist
- You must have record creation privileges
**Access**: Cases → Case Details → "Upload Record" or `/records/create`
**Steps**:
1. Open the desired case
2. Click "Upload New Record" or navigate to `/records/create`
3. Fill in the following information:
   - **Case id**: Select Case to which record belongs
   - **Record Type**: Select the type (Evidence, FIR, etc)
   - **File**: Upload the record file (click "Choose File")
   - **Description**: Provide details about the record
   - **Policy**: Select Policy from dropdown
4. Click "Upload Record"
5. The record will be stored

#### Viewing Records

**Access**: Dashboard → Records or `/records/list`
**Features**:
- View all records you have access to
- See record id, type, and associated case
- Preview records

#### Record Details

**Information Displayed**:
- Record ID
- Associated case information
- File type and size
- Access policies

#### Deleting Records

**Steps**:
1. Open a record
2. Click "Delete Record"
3. Confirm the deletion
4. The record will be marked as deleted

---

### Access Control & Policies

#### Understanding Access Control

The CDMS uses **Policy-Based Access Control (PBAC)** to manage who can access what data:

- **Organization Separation**: Users can only see data from their assigned organization
- **Role-Based Control**: Different roles (Admin, Investigator, Judge, Forensics) have different permissions
- **Policy-Based Control**: Specific policies define granular access to cases and records

#### Types of Policies

1. **Case Access Policy**
   - Controls who can view.

2. **Record Access Policy**
   - Controls who can access specific records

3. **Organization Policy**
   - Controls data isolation between organizations
   - Ensures users only see organization-specific data

#### Creating an Access Policy

**Prerequisites**: 
- You must be an Admin

**Access**: Dashboard → Policies → "Create New Policy" or `/policies/create`

**Steps**:
1. Click "Policies" in the navigation menu
2. Click "Create New Policy"
3. Fill in the following information:
   - **Policy Name**: A descriptive name (e.g., "Senior Case Review Access")
   - **Policy Type**: Select policy categories
   - **Access Level**: Choose from different organizations and different roles
4. Click "Create Policy"
5. The policy is now active and will be enforced

#### Managing Policies

**View Existing Policies**:
1. Go to Policies menu
2. See list of all policies
3. Click a policy to view details

#### How Access Control Works in Practice

**Example 1: Basic User Access**
- User logs in with their username and password
- System checks their role and organization
- Dashboard shows only data from their organization
- Cases list shows only cases they can access via policies or default organization access
- Records list is filtered based on policies

**Example 2: Cross-Organization Access**
- User from Org1 wants to view a record from Org2
- Admin goes to Policies and creates a new policy
- Record with created with the specific policy
- User can now access that record despite being from Org1