# MACEDA_CTINASSL_INF241_2627

Urban Roll

A React + Vite prototype based on the provided Urban Roll login, sign-up, password reset, tea menu, sushi menu, and item-detail screens.

## Repository layout

- `URBAN/` contains the Urban Roll application.
- `files/` contains the course activity PDF.

## Run locally

Make sure the MongoDB Windows service is running. In one terminal, start the API:

```sh
cd URBAN
npm install
npm run server
```

In a second terminal, start the frontend:

```sh
cd URBAN
npm run dev
```

The API connects to `mongodb://127.0.0.1:27017/urban_roll` by default. Check `http://127.0.0.1:3001/api/health` for API and database status. Set the `MONGODB_URI` environment variable to use a different connection string; keep credentials private and out of source control.

Create an account from the sign-up screen, then use the username or email and password to log in. Account records are stored in the MongoDB `users` collection; passwords are stored as bcrypt hashes. Password reset is unavailable until email verification is configured. Search checks both the tea and sushi menus, regardless of the active category. Cart items and the **Order Now** demo confirmation remain in memory and do not contact a restaurant.
