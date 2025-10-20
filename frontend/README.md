# Frontend (Vite + React)

This app talks to the Spring Boot backend through the `/api` routes. The HTTP client automatically uses:

- `VITE_API_BASE_URL` (or the alias `VITE_BASE_URL`) when provided (e.g. `http://192.168.49.2:30080/api` for Minikube NodePort; if you supply only the host, the app automatically adds `/api`)
- otherwise, `/api` is appended to the active origin—except for the Vite dev server (`localhost:5173`), which automatically points to `http://localhost:8081/api`

## Local development

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` calls to the backend. By default it targets `http://localhost:8081`. Override the proxy target if your backend runs elsewhere:

```bash
# e.g. point at a Minikube NodePort from the host
VITE_DEV_API_BASE_URL=http://192.168.49.2:30080 npm run dev
```

If you want the built assets to call a remote backend, set `VITE_API_BASE_URL` before building:

```bash
VITE_API_BASE_URL=http://192.168.49.2:30080/api npm run build
```

Either env name works; use whichever matches your deployment tooling.

## Production build preview

```bash
npm run build
npm run preview
```

`npm run preview` serves the built assets locally so you can verify the frontend still reaches your configured backend URL.
