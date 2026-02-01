# MasterG - Government Exam Preparation Platform

A full-stack DBMS Project designed for college submissions. This application simulates a real-world EdTech platform for exams like SSC, Banking, and UPSC.

## 🚀 Features

1.  **Exam Interface**: Real-time timer, question palette, and review marking.
2.  **DBMS-Driven Leaderboard**: Ranks students using SQL Aggregations.
3.  **Analytics**: detailed breakdowns of accuracy and time management.
4.  **Admin Panel**: Bulk CSV upload simulation for question entry.
5.  **Transaction Logic**: Ensures data integrity during test submission.

## 🛠️ Tech Stack

*   **Frontend**: React.js (TypeScript), Tailwind CSS, Vite.
*   **Data Simulation**: LocalStorage-based Mock DB (for instant demo without backend setup).
*   **Database Design**: MySQL (Schema provided in `backend/schema.sql`).

## 📂 Project Structure

*   `src/pages`: Individual screens (Dashboard, Test, Result).
*   `src/services`: Mock backend logic (`mockDatabase.ts`) mimicking API calls.
*   `backend`: Contains the SQL schema file required for the Viva.

## 🎓 DBMS Viva Questions Preparedness

1.  **Normalization**: The database is in 3NF. `options` are separated from `questions` to prevent repeating groups (1NF) and transitive dependencies.
2.  **Transactions**: The test submission process involves inserting into `attempt_history` and `attempt_details`. This must be atomic. If detail insertion fails, the history record is rolled back.
3.  **Indexes**: We use indexes on `(user_id, score)` in the history table to make the Leaderboard query `ORDER BY score DESC` faster.

## 🏃‍♂️ How to Run

1.  Clone repository.
2.  `npm install`
3.  `npm start`
4.  Open `http://localhost:3000`

## 👨‍💻 Admin Credentials (Demo)

*   **Email**: admin@masterg.com
*   **Role**: Select "Admin" on login screen.
