
# Project 1 Setup Instructions
Follow these steps to set up and run the project.

## Step 1: Start Servers
Start your MySQL server and Apache Web Server through XAMPP.

## Step 2: Create Database
Open your web browser and go to MySQL phpMyAdmin. Create a new database named `test` if it doesn't already exist.

## Step 3: Create and Modify Table
Execute the following SQL queries to create and modify the `Users` table in the `test` database:

CREATE TABLE Users(
   username VARCHAR(50) primary key,
   password VARCHAR(50), // maybe encrypted or a hash?
   firstname VARCHAR(50),
   lastname VARCHAR(50),
   salary FLOAT,
   age INTEGER,
   registerday DATE,
   signintime DATETIME
) 

ALTER TABLE Users ADD user_id INT AUTO_INCREMENT PRIMARY KEY;

ALTER TABLE Users DROP PRIMARY KEY;

ALTER TABLE Users ADD user_id INT AUTO_INCREMENT PRIMARY KEY;

## Step 4: Setup Project Files
Download and unzip our Project 1, then place the files at this location:
`XAMPP/xamppfiles/htdocs/database_javascript/project1`

## Step 5: Start Backend Server
Navigate to the backend directory via Terminal or Command Prompt:
cd /Applications/XAMPP/xamppfiles/htdocs/database_javascript/project1/Backend

Run the command `npm start` to start up your server.

## Step 6: Access the Frontend
You can access the frontend applications through the following URLs:

- **Admin Frontend:** `http://localhost/database_javascript/project1/Frontend/index.html`
- **User Frontend:** `http://localhost/database_javascript/project1/Frontend/signin.html`
