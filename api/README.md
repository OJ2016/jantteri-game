# API (Flask Backend)

This folder will contain the Flask backend application.

## Structure
```
api/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (API keys, etc.)
└── routes/            # API route handlers
```

## Shared Dependencies
- Protobuf definitions: `../jantteri-messages/`
- Runtime dependency: `../node_modules/@protobuf-ts/runtime`

## Development
```bash
# From root directory
npm run dev:api

# Or directly
cd api && python app.py
```
