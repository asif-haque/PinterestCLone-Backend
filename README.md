# Pinteresting

Pinteresting is my first web application in backend. With features inspired by Pinterest, users can create collections of images, making it a convenient tool for curating and sharing inspiration.

## Features

- **User Authentication**: Secure user authentication system allows users to sign up, log in, and log out of their accounts.
- **Like**: Users can like content they enjoy, saving it to their profile for future reference.
- **Bookmark**: Users can bookmark content to easily access it later, organizing their saved items into collections.
- **Feed**: Users can enjoy and learn from others through the feed section.

## Tech Stack

- **Frontend**: EJS (Embedded JavaScript) templating engine for dynamic content rendering.
- **CSS Framework**: Tailwind CSS for responsive and customizable styling.
- **Backend**: Node.js and Express.js for building the server-side logic.
- **Database**: MongoDB for storing user data, likes, and bookmarks.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/pinteresting.git
   ```

2. Install dependencies:

   ```bash
   cd pinteresting
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pinteresting
   ```

   Replace `your_session_secret` with a randomly generated string for session encryption.

4. Run the application:

   ```bash
   npm start
   ```

   The application should now be running on `http://localhost:3000`.
