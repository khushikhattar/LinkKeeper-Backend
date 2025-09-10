# 📌 LinkKeeper
[![Live Backend](https://img.shields.io/badge/API-Live-brightgreen)](https://linkkeeper-backend.onrender.com)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-000000?style=for-the-badge&logo=typescript&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSONwebtokens&logoColor=white)
![NanoID](https://img.shields.io/badge/NanoID-000000?style=for-the-badge&logo=nanoid&logoColor=white)

LinkKeeper is a full-stack application to **save, organize, and share links/content** with tags.  
It includes **user authentication**, **JWT access/refresh token flow**, **tagging system**, and **public share links**.

---

## 🚀 Features

- 🔑 **Authentication**

  - Sign up, login, logout
  - Access & refresh tokens stored in cookies
  - Secure password handling with hashing
  - Profile update & account deletion

- 📂 **Content Management**

  - Add links with type (`image`, `video`, `article`, `audio`, `document`, `tweet`)
  - Delete user’s content
  - Fetch all content for a user
  - Search content by **tags** or **date**

- 🏷 **Tagging**

  - Create new tags
  - Add tags to content
  - Remove tags from content
  - Fetch content filtered by tags

- 🔗 **Sharing**
  - Generate a unique **shareable link**
  - Toggle share on/off
  - Publicly view shared content by hash

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB + Mongoose
- **Validation:** Zod
- **Authentication:** JWT (Access + Refresh Tokens stored in cookies)
- **Utilities:** NanoID

---

## 📂 Project Structure

```
src/
├─ models/
│ ├─ content.model.ts
│ ├─ link.model.ts
│ ├─ tag.model.ts
│ └─ user.model.ts
├─ middlewares/
│ └─ auth.middleware.ts
├─ routes/
│ ├─ user.routes.ts
│ ├─ tag.routes.ts
│ ├─ content.routes.ts
│ └─ index.routes.ts
├─ utils/
│ └─ helper.ts
├─ app.ts
└─ server.ts
controllers/
├─ user.controller.ts # Authentication & user profile
├─ content.controller.ts # Content management & sharing
└─ tag.controller.ts # Tagging system
```

---

## ⚙️ Setup & Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/linkkeeper.git
cd linkkeeper
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Variables**

- **Create a .env file in the root directory:**

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/linkkeeper
ACCESS_TOKEN_SECRET=youraccesstokensecret
REFRESH_TOKEN_SECRET=yourrefreshtokensecret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

4. **Run the application**

```bash
npm run dev
```

## 📡 API Endpoints

- **🔑 Authentication (/api/users)**
  | Method | Endpoint | Description |
  | ------ | ----------- | ------------------------- |
  | POST | `/register` | Register new user |
  | POST | `/login` | Login with username/email |
  | POST | `/logout` | Logout user |
  | GET | `/me` | Get current user |
  | PATCH | `/update` | Update profile |
  | DELETE | `/` | Delete account |
  | POST | `/refresh` | Refresh access token |

- **📂 Content (/api/content)**
  | Method | Endpoint | Description |
  | ------ | --------------- | ----------------------------- |
  | POST | `/add` | Add new content |
  | DELETE | `/:id` | Delete content by ID |
  | GET | `/user-content` | Fetch user's content |
  | POST | `/share` | Toggle share on/off |
  | GET | `/:hash` | Access shared content |
  | GET | `/my-link` | Get current user's share link |

- **🏷 Tags (/api/tags)**
  | Method | Endpoint | Description |
  | ------ | --------------------------------- | --------------------------- |
  | POST | `/add` | Create new tag |
  | POST | `/content/tags` | Add tags to content |
  | DELETE | `/content/:contentId/tags/:tagId` | Remove tag from content |
  | GET | `/content/search` | Search content by tags/date |

## 🧑‍💻 Development Notes

- Cookies are set with { httpOnly: true, secure: true } for security.
- Passwords are hashed using bcrypt before saving (user.model.ts).
- Refresh tokens are stored in the database and rotated on login/refresh.
- API request validation is handled with Zod.

- Relations:
- Content → Tags (Content.tags)
- User → Content (User.content)

## 🔮 Future Work

1. Integrate vector databases to enable real-time semantic search on tags and content.
2. Add pagination and filtering for large datasets.
3. Implement role-based access control for multi-user environments.
4. Optimize database indexing for faster queries.
5. Add rate limiting & caching (Redis) for better scalability.
