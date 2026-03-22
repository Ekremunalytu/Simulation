.PHONY: dev build preview lint install clean typecheck

APP_DIR = app

# Dev server
dev:
	cd $(APP_DIR) && npm run dev

# Production build
build:
	cd $(APP_DIR) && npm run build

# Preview production build
preview:
	cd $(APP_DIR) && npm run preview

# Lint
lint:
	cd $(APP_DIR) && npm run lint

# Type check only (no emit)
typecheck:
	cd $(APP_DIR) && npx tsc -b --noEmit

# Install dependencies
install:
	cd $(APP_DIR) && npm install

# Clean build artifacts
clean:
	rm -rf $(APP_DIR)/dist $(APP_DIR)/node_modules/.vite

# Fresh start: clean + install + build
fresh: clean install build
