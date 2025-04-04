# Web Crawler Frontend

A simple React-based frontend for the Web Crawler API. This application allows you to:

- Start new crawl jobs by providing domains and maximum crawl depth
- Monitor the status of ongoing crawl tasks
- View and export the URLs found by the crawler
- Check the health status of the backend services

## Features

- React-based user interface with Bootstrap styling
- Real-time status updates for crawling tasks
- Persistent storage of tasks in localStorage
- Copy URLs to clipboard with a single click
- Responsive design for desktop and mobile

## Prerequisites

- Node.js 14+ and npm
- Web Crawler API running on http://localhost:8000 (or configured proxy)

## Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

## Configuration

The frontend is configured to proxy API requests to http://localhost:8000 by default. If your API is running at a different location, update the "proxy" field in `package.json`.

## Environment Variables

This application uses environment variables for configuration:

### Development
In development mode, the app uses the proxy configuration in `package.json` to forward API requests to the backend server.

### Production
For production deployment, create a `.env.production` file with:

```
REACT_APP_API_URL=https://your-production-api-url.com
```

Replace `https://your-production-api-url.com` with your actual production API URL.

## Usage

1. Start a new crawl by entering one or more domains (comma or newline separated)
2. Set the maximum crawl depth (higher values will take longer but find more URLs)
3. Click "Start Crawl" to begin the crawling process
4. Monitor task status in the Tasks panel
5. When a task is completed, select it to view the crawled URLs
6. Click on a domain to see all URLs found for that domain
7. Use the "Copy" or "Copy All" buttons to export URLs to clipboard

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## License

MIT 