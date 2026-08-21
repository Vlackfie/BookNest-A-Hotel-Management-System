# 🏨 BookNest: A Hotel Management System

**BookNest** is a comprehensive web application developed as a course project for our Database Management Systems (DBMS) module. The system streamlines hotel operations—managing rooms, reservations, guests, employees, and payments—by connecting a dynamic React frontend to a robust MySQL relational database via a Node.js backend.

---

## 📌 Project Overview

BookNest provides an intuitive dashboard for hotel administrators and staff to:
* 🛏️ **Room Management:** Monitor room types, clean/occupied statuses, and dynamic pricing.
* 👥 **Guest Management:** Register and maintain complete profiles of hotel guests.
* 📅 **Reservation Management:** Seamlessly handle bookings, check-ins, and check-outs.
* 💳 **Payment Management:** Process billing, track transaction histories, and issue invoices.
* 👔 **Employee Management:** Oversee staff roles, shifts, and department assignments.
* 📊 **Reports & Statistics:** View automated insight analytics for occupancy rates and revenue.

---

## 🎯 Objectives

* Design a normalized relational database schema ($1\text{st}$, $2\text{nd}$, and $3\text{rd}$ Normal Forms) to eliminate data redundancy.
* Build a secure REST API backend to securely handle CRUD operations between the app and MySQL.
* Create a responsive, user-friendly frontend interface for seamless hotel operations.
* Enforce data integrity via advanced SQL constraints, triggers, and relational mappings.

---

## 🛠 Tech Stack & Tools

* **Frontend:** HTML5, CSS3, JavaScript, React.js
* **Backend:** Node.js, Express.js
* **Database Engine:** MySQL (via XAMPP / Local Instance)
* **Modeling Tools:** Draw.io / Lucidchart (for ER and Relational Schemas)

---
## 🏗️ System Architecture 

```text
       [ Client Layer ]              [ Application Layer ]              [ Data Layer ]
  +--------------------------+     +------------------------+     +------------------------+
  |   React SPA (Vite)       |     |  Express.js Engine     |     |   MySQL Instance       |
  |  +--------------------+  |     |  +------------------+  |     |  +------------------+  |
  |  | Tailwind UI /      |  |     |  | Rate Limiter /   |  |     |  | Connection Pool |  |
  |  | Context / State    |  |     |  | Helmet / CORS    |  |     |  +------------------+  |
  |  +--------------------+  |     |  +------------------+  |     |           |            |
  |            |             |     |           |            |     |  +------------------+  |
  |      HTTP/HTTPS          |     |  +------------------+  |     |  | Normalized Rel-  |  |
  |   JSON / REST APIs       |====>|  | JWT / RBAC Guard |  |====>|  | ational Tables   |  |
  |            |             |     |  +------------------+  |     |  | (InnoDB Engine)  |  |
  |            v             |     |           |            |     |  +------------------+  |
  |  +--------------------+  |     |  +------------------+  |     |           |            |
  |  | Axios HTTP Client  |  |     |  | Controllers /    |  |     |  | Triggers /       |  |
  |  | Interceptors       |  |     |  | Business Logic   |  |     |  | Constraints /    |  |
  |  +--------------------+  |     |  +------------------+  |     |  | Indexes          |  |
  +--------------------------+     +------------------------+     +------------------------+
```
---

## 📂Entity-Relationship (ER) Diagram & Schema

<img width="1209" height="1616" alt="B64D7C13-0976-475A-A42E-CBE1DAC4C924_1_201_a" src="https://github.com/user-attachments/assets/c14e06cb-ce50-4a9c-92a2-7ee3ab688291" />



---

## 📌 ScreenShots 
## Login Page 
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 22 54 PM" src="https://github.com/user-attachments/assets/13127d31-1f95-47ee-990f-c60d373e1ed0" />

## Dashboard of owner
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 23 45 PM" src="https://github.com/user-attachments/assets/cdfeb098-6654-40d5-b712-b682f299b2f4" />

## Room Management And Reservation  
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 23 56 PM" src="https://github.com/user-attachments/assets/bc83ce52-33c3-404d-a935-0bd31e6a39cb" />

---
---
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 24 04 PM" src="https://github.com/user-attachments/assets/7e397bcc-a1c0-4e40-a7d8-652d4e44e9bf" />

---
---
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 24 20 PM" src="https://github.com/user-attachments/assets/229cbd6a-452c-4d69-b607-8d839e2ccc75" />

## Guest Directory 
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 25 09 PM" src="https://github.com/user-attachments/assets/67422058-2bec-47dd-bdc9-ce1c393bc1b5" />


## Create New Guest 
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 25 22 PM" src="https://github.com/user-attachments/assets/d97d3099-7293-41f5-b322-7c77ebfdfe39" />

## Update Guests
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 25 31 PM" src="https://github.com/user-attachments/assets/1d604167-ff64-4343-8536-4807a57b7b75" />

## Delete Guest 
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 25 44 PM" src="https://github.com/user-attachments/assets/d87f606f-0e15-41f4-9477-f546d55b9aa3" />

## Dashboard of Housekeeping Satff
<img width="1693" height="937" alt="Screenshot 2026-08-06 at 10 27 28 PM" src="https://github.com/user-attachments/assets/989a8361-ef29-42aa-a083-4800e3949d44" />

## INVOICE 
<img width="618" height="866" alt="Screenshot 2026-08-19 at 12 26 53 AM" src="https://github.com/user-attachments/assets/8ceed76a-8504-47e1-8db1-4e27bacc180a" />

---
---
## 🔐 User Passwrds
|Role | Email Address| Username | Password|
|-----|--------------|----------|---------|
| Owner | owner@booknest.com | owner |	password123 |
| Manager | manager@booknest.com | manager | password123 |
| Receptionist | receptionist@booknest.com | receptionist | password123 |
| Housekeeping | housekeeping@booknest.com | housekeeper | password123 |
| Maintenance | maintenance@booknest.com | maintenance | password123 |
---
---

## 👥 Team Members

| Name | Role |
|------|------|
| Sadikul Hossain & Tawhid Sharihar | Frontend & Database Design |
| Sadikul Hossain  | SQL Development, Backend & UI/UX |
| Proshonjeet Debnath | Documentation & Testing |

---

## 📚 Course

Database Management System (DBMS)

---

## 📄 Licenseadd

This project is developed for educational purposes only.
