# Contributing to VisualSpec

Thank you for your interest in contributing to **VisualSpec**! We welcome contributions from developers, designers, prompt engineers, and AI agent builders.

VisualSpec is built on a core philosophy:
> **Separate generative visual concerns from deterministic typography and layout, backed by structured machine-readable specifications and hard constraint validation.**

---

## 🛠 Development Setup

### Prerequisites
- **Node.js**: >= 18.0.0 (Tested on Node 20 & 24)
- **npm**: >= 9.0.0

### Getting Started

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/visualspec.git
   cd visualspec
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run the test suite**:
   ```bash
   npm test
   ```

5. **Typecheck without emitting**:
   ```bash
   npm run typecheck
   ```

6. **Run CLI in development mode**:
   ```bash
   npx tsx src/cli/index.ts --help
   # or
   npm run visual -- --help
   ```

---

## 🧩 Ways to Contribute

### 1. Add a New Platform Pack

Platform packs describe dimensions, aspect ratios, safe margins, and anti-patterns for specific social feeds and advertising networks.

- Add a YAML file in `platforms/<platform-name>.yaml`
- Follow `schemas/platform.schema.json`
- Ensure default formats (e.g. `feed_portrait`, `square`, `story`, `banner`) and safe margins are specified.
- Add tests in `tests/core/resolver.test.ts`.

### 2. Add a New Layout Template

Templates define structural archetypes answering *"what elements belong where?"*.

- Add a YAML file in `templates/<template-id>.yaml`
- Follow `schemas/template.schema.json`
- Define required slots, optional slots, and region layout hints (e.g. `upper_third`, `center`, `lower_two_thirds`, `below_headline`).
- Add an example spec in `examples/<template-id>/spec.yaml`.

### 3. Add a New Image Model Adapter

Adapters bridge VisualSpec specifications to generative image models (e.g. Flux, Stable Diffusion, ComfyUI, Midjourney API).

- Create `src/adapters/<provider>-adapter.ts` extending `BaseImageAdapter`.
- Implement `compile(spec: ResolvedVisualSpec)` and `generate(request: CompiledGenerationRequest)`.
- Register the adapter in `src/adapters/index.ts`.
- See [docs/adding-a-new-provider.md](docs/adding-a-new-provider.md) for step-by-step guidance.

### 4. Enhance Agent Skills

Skills live in `skills/<skill-name>/SKILL.md` and instruct AI agents (Cursor, Claude, Gemini CLI) on how to reason about briefs, typography, constraints, and repair workflows.

---

## 🧪 Testing & Quality Guidelines

Before submitting your pull request, verify:

1. **Tests pass**:
   ```bash
   npm test
   ```
2. **TypeScript compiles cleanly**:
   ```bash
   npm run typecheck
   npm run build
   ```
3. **Deterministic tests require no API keys**:
   All local rendering, schema validation, prompt compilation, and layout tests must pass offline using the built-in mock adapter.

---

## 📋 Pull Request Process

1. Create a descriptive branch:
   ```bash
   git checkout -b feature/my-new-platform
   ```
2. Commit your changes with clear, descriptive commit messages.
3. Push to your fork and submit a Pull Request to `main`.
4. Fill out the PR template describing your changes, motivation, and test coverage.
5. Our maintainers will review your PR and provide feedback!

---

## 📜 Code of Conduct

All contributors and maintainers agree to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
