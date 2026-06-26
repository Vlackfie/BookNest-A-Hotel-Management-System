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

## 📂 Project Structure

```text
BookNest/
│
├── backend/                 # Node.js & Express server
│   ├── config/              # MySQL database connection setup
│   ├── controllers/         # API logic (handling check-ins, payments, etc.)
│   ├── routes/              # API endpoints URL routing
│   └── package.json
│
├── frontend/                # React.js Application
│   ├── public/              # Static assets (HTML, Icons)
│   ├── src/                 # React components and CSS styling
│   └── package.json
│
├── database/                # SQL Database Scripts
│   ├── schema.sql           # Table structures, primary/foreign keys, and constraints
│   ├── insert_data.sql      # Mock data to seed the database for testing
│   └── triggers.sql         # Automation scripts (e.g., auto-updating room status)
│
├── diagrams/                # Database Architecture
│   ├── er_diagram.png       # Conceptual Entity-Relationship Diagram
│   └── relational_schema.png# Logical database design mapping
│
├── documentation/           # Academic Reports
│   └── Project_Report.pdf   # Final formal academic report
│
├── README.md                # Project documentation home
└── .gitignore               # Excludes node_modules, .env secrets, etc.
```

---

## 👥 Team Members

| Name | Role |
|------|------|
| Sadikul Hossain & Tawhid Sharihar | Database Design |
| Sadikul Hossain  | SQL Development |
| Proshonjeet Debnath | Documentation & Testing |

---

## 📚 Course

Database Management System (DBMS)

---

## 📄 License

This project is developed for educational purposes only.
