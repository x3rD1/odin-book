# Memeo

> Social media platform for sharing memes built with React, Node.js, PostgreSQL, Prisma, and Socket.IO.

**Live Demo:** https://memeo.meme
**Frontend:** React
**Backend:** Express + Prisma
**Database:** PostgreSQL

---

## About

Memeo is a full-stack social platform that allows users to share memes, interact with posts, and connect with other users. The application focuses on building a complete social media experience including authentication, media uploads, pagination, and real-time notifications.

The project demonstrates RESTful API design, relational database modeling, real-time notifications, and modern full-stack development practices.

---

## Features

### Social

- Create posts
- Upload media
- Like posts
- Comment on posts
- Follow / Unfollow users
- User profiles

### Authentication

- User registration
- Login / Logout
- Protected routes
- Session-based authentication

### Media

- Image uploads
- Cloudinary storage

### Real-Time

- Live notifications using Socket.IO
- Optimistic updates

### Performance

- Cursor-based pagination
- Optimized database queries

---

## Tech Stack

### Frontend

- React
- JavaScript
- Context API

### Backend

- Node.js
- Express
- Prisma ORM
- Socket.IO

### Database

- PostgreSQL

---

## Architecture

       ┌─────────────────────────────────────────────────────────┐
       │                      React Client                       │
       └────────────────────┬───────────────┬────────────────────┘
                            │               │
                            │ (REST API)    │ (WebSockets)
                            ▼               ▼
       ┌─────────────────────────────────────────────────────────┐
       │                     Express Server                      │
       └────────────────────┬───────────────┬────────────────────┘
                            │               │
               (Prisma ORM) │               │ (Cloudinary SDK)
                            ▼               ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   PostgreSQL Database  │       │       Cloudinary       │
       │     (Data Storage)     │       │    (Media Storage)     │
       └────────────────────────┘       └────────────────────────┘
                            ▲
                            │
               ┌────────────┴──────────────┐
               │        Socket.IO          │
               │ (Real-time Notifications) │
               └───────────────────────────┘

---

## Highlights

### RESTful API

Designed a REST API separating authentication, social interactions, media uploads, and user management into independent resources.

### Relational Database Design

Modeled relationships between users, posts, comments, likes, and follows using PostgreSQL and Prisma ORM.

### Cursor Pagination

Implemented cursor-based pagination to efficiently load large feeds without relying on offset pagination.

### Real-Time Notifications

Used Socket.IO to instantly notify users about interactions such as likes and follows.

### Media Uploads

Integrated Cloudinary to offload image storage while keeping the backend responsible for validation and metadata.
