# CSE 340 Service Network

A web application built with Node.js and Express that promotes service across the world by connecting volunteers with service opportunities in their community.

## Features

- **Home Page**: Welcome and mission statement
- **Organizations**: Partner organizations with contact information
- **Projects**: Service projects available through the network
- **About**: Information about the CSE 340 Service Network

## Tech Stack

- **Backend**: Node.js, Express.js
- **Templating**: EJS
- **Styling**: CSS3
- **Database**: PostgreSQL (optional)
- **Deployment**: Render

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/kalungiisaac/CSE-340-COURSE-REPO.git
cd CSE-340-COURSE-REPO
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file and add your configuration:
```
NODE_ENV=development
PORT=3000
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Development

### Using Nodemon
For automatic restart during development:
```bash
npm install -g nodemon
nodemon
```

### Project Structure
```
├── server.js              # Express server configuration
├── public/                # Static files (CSS, images)
│   ├── css/
│   ├── images/
│               
├── src/
│   ├── views/            # EJS templates
│   │   ├── home.ejs
│   │   ├── organizations.ejs
│   │   ├── projects.ejs
│   │   └── partials/     # Reusable components
│   │       ├── header.ejs
│   │       └── footer.ejs
│   └── database/         # Database configurations
└── package.json          # Dependencies
```

## Available Routes

- `/` - Home page
- `/organizations` - Organizations page
- `/projects` - Projects page

## Environment Variables

```env
NODE_ENV=development           # development or production
PORT=3000                      # Server port
DB_HOST=localhost             # Database host
DB_PORT=5432                  # Database port
DB_NAME=cse340                # Database name
DB_USER=postgres              # Database user
DB_PASSWORD=password          # Database password
APP_NAME=CSE 340 Service Network
APP_URL=http://localhost:3000
```

## Deployment

### Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Configure environment variables in Render dashboard
4. Deploy automatically on push

The `render.yaml` file contains the deployment configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Contact

- **Project**: CSE 340 Service Network
- **Repository**: https://github.com/kalungiisaac/CSE-340-COURSE-REPO

## Support

For issues and questions, please open an issue in the GitHub repository.

