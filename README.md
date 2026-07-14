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

## 📚 Course

Database Management System (DBMS)

---

## 📄 License

This project is developed for educational purposes only.
