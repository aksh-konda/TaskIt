COMPOSE = docker compose
COMPOSE_DEV = docker compose -f docker-compose.dev.yml

.PHONY: help dev dev-front dev-back dev-down dev-reset dev-logs prod prod-down

help:
	@echo "Available targets:"
	@echo "  make dev        - Start full development stack (frontend, backend, postgres)"
	@echo "  make dev-front  - Start frontend dev flow (includes backend + postgres via depends_on)"
	@echo "  make dev-back   - Start backend + postgres development flow"
	@echo "  make dev-down   - Stop development stack"
	@echo "  make dev-reset  - Stop development stack and remove volumes"
	@echo "  make dev-logs   - Follow development stack logs"
	@echo "  make prod       - Start production-style stack with build"
	@echo "  make prod-down  - Stop production-style stack"

dev:
	$(COMPOSE_DEV) up

dev-front:
	$(COMPOSE_DEV) up frontend

dev-back:
	$(COMPOSE_DEV) up backend postgres

dev-down:
	$(COMPOSE_DEV) down

dev-reset:
	$(COMPOSE_DEV) down -v

dev-logs:
	$(COMPOSE_DEV) logs -f

prod:
	$(COMPOSE) up --build

prod-down:
	$(COMPOSE) down
