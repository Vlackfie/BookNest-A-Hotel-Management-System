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

## 📂Entity-Relationship (ER) Diagram & Schema\
```text
[roles] 1 ------N [users] 1 ------ 1 [employees] 1 ------ N [attendance]
                      |                     |
                      |                     +------------- N [salaries]
                      |
                      +--- 1 [guests] 1 ------ N [bookings] 1 ------ N [payments]
                                                   |
                                                   +------ 1 [check_ins] 1 --- 1 [check_outs]
                                                   |
                                                   +------ N [service_requests] <--- N [services]
 
 [room_types] 1 ------ N [rooms] 1 ------ N [housekeeping]
                          |
                          +------ N [maintenance]
                          
 [inventory] 
 [feedback]
 [reports]
 [activity_logs]
 [notifications]
 [system_settings]

```

---

## 👥 Team Members

| Name | Role |
|------|------|
| Sadikul Hossain & Tawhid Sharihar | Frontend & Database Design |
| Sadikul Hossain  | SQL Development, Backend & UI/UX |
| Proshonjeet Debnath | Documentation & Testing |

---
---

## 📌 ScreenShots 
## Login Page 
<img width="3420" height="1873" alt="2D62B830-0BAD-4480-812D-E69C4901BD4B_1_201_a" src="https://github.com/user-attachments/assets/27ee967b-2c69-4880-b657-a9cce4f1d53e" />

## Room Management 
<img width="3420" height="2048" alt="C0E29541-0B8D-47EB-851F-6F79416AEC7E_1_201_a" src="https://github.com/user-attachments/assets/922ef6c4-fe74-4580-b8ad-aa4c12775f23" />

## Dashboard
<img width="3420" height="2048" alt="5FBE8314-B5DC-4026-B7D2-E15DFBE4FEDE_1_201_a" src="https://github.com/user-attachments/assets/6ee981ca-0b36-49eb-ab34-533148206552" />

## Create New Guest 
<img width="3420" height="2052" alt="805576B9-C7A3-4A2C-BEEF-912D13873268_1_201_a" src="https://github.com/user-attachments/assets/045a64d8-a1b3-4daa-9a3b-61ff94f6df79" />

## Guest Directory 
<img width="3420" height="2040" alt="93F312F5-C860-49BA-86F2-E127C1B19855_1_201_a" src="https://github.com/user-attachments/assets/5ea7eb84-ae6f-4315-b512-f09f700df1a2" />


---

## 📚 Course

Database Management System (DBMS)

---

## 📄 License

This project is developed for educational purposes only.
